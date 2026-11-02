import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { connect, type ClientHttp2Session } from 'http2';
import { PrismaService } from 'src/prisma/prisma.service';

export interface PushMessage {
  title: string;
  body: string;
  /** Opened in the app when the notification is tapped, e.g. "/order/123" */
  route?: string;
  data?: Record<string, string>;
}

/**
 * Sends push notifications without extra dependencies:
 *  - Android → Firebase Cloud Messaging HTTP v1 (service-account JWT → OAuth token)
 *  - iOS     → Apple Push Notification service over HTTP/2 (token-based .p8 auth)
 * Missing credentials simply disable that platform (logged once), so the API keeps working.
 */
@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private fcmToken: { value: string; expiresAt: number } | null = null;
  private apnsJwt: { value: string; issuedAt: number } | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  async notifyClient(clientId: string, message: PushMessage) {
    try {
      const devices = await this.prisma.deviceToken.findMany({ where: { clientId } });
      await Promise.all(
        devices.map((d) =>
          d.platform === 'IOS'
            ? this.sendApns(d.token, message)
            : d.platform === 'ANDROID'
              ? this.sendFcm(d.token, message)
              : Promise.resolve(),
        ),
      );
    } catch (err) {
      // Notifications must never break the business action that triggered them
      this.logger.warn(`Push to client ${clientId} failed: ${(err as Error).message}`);
    }
  }

  // ───────────── Android (FCM v1) ─────────────
  private fcmConfig() {
    const projectId = this.config.get<string>('FCM_PROJECT_ID');
    const clientEmail = this.config.get<string>('FCM_CLIENT_EMAIL');
    const privateKey = this.config.get<string>('FCM_PRIVATE_KEY')?.replace(/\\n/g, '\n');
    return projectId && clientEmail && privateKey ? { projectId, clientEmail, privateKey } : null;
  }

  private async fcmAccessToken(cfg: { clientEmail: string; privateKey: string }) {
    if (this.fcmToken && this.fcmToken.expiresAt > Date.now() + 60_000) return this.fcmToken.value;
    const now = Math.floor(Date.now() / 1000);
    const assertion = this.jwt.sign(
      {
        iss: cfg.clientEmail,
        scope: 'https://www.googleapis.com/auth/firebase.messaging',
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600,
      },
      { privateKey: cfg.privateKey, algorithm: 'RS256' },
    );
    const res = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
    );
    this.fcmToken = { value: res.data.access_token, expiresAt: Date.now() + res.data.expires_in * 1000 };
    return this.fcmToken.value;
  }

  private async sendFcm(token: string, msg: PushMessage) {
    const cfg = this.fcmConfig();
    if (!cfg) return this.logger.debug('FCM not configured; skipping Android push');
    const accessToken = await this.fcmAccessToken(cfg);
    try {
      await axios.post(
        `https://fcm.googleapis.com/v1/projects/${cfg.projectId}/messages:send`,
        {
          message: {
            token,
            notification: { title: msg.title, body: msg.body },
            data: { ...(msg.data || {}), ...(msg.route ? { route: msg.route } : {}) },
            android: {
              priority: 'HIGH',
              notification: { channel_id: 'ocare_updates', color: '#0A4D1F', icon: 'ic_stat_ocare' },
            },
          },
        },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
    } catch (err: any) {
      const code = err?.response?.data?.error?.details?.[0]?.errorCode || err?.response?.data?.error?.status;
      if (code === 'UNREGISTERED' || code === 'NOT_FOUND' || code === 'INVALID_ARGUMENT') {
        await this.prisma.deviceToken.deleteMany({ where: { token } });
      } else {
        this.logger.warn(`FCM send failed: ${JSON.stringify(err?.response?.data || err.message)}`);
      }
    }
  }

  // ───────────── iOS (APNs) ─────────────
  private apnsConfig() {
    const keyId = this.config.get<string>('APNS_KEY_ID');
    const teamId = this.config.get<string>('APNS_TEAM_ID');
    const bundleId = this.config.get<string>('APNS_BUNDLE_ID');
    const privateKey = this.config.get<string>('APNS_PRIVATE_KEY')?.replace(/\\n/g, '\n');
    const production = this.config.get<string>('APNS_PRODUCTION') === 'true';
    return keyId && teamId && bundleId && privateKey ? { keyId, teamId, bundleId, privateKey, production } : null;
  }

  private apnsAuthToken(cfg: { keyId: string; teamId: string; privateKey: string }) {
    // Apple wants the token refreshed at most every 20–60 minutes
    if (this.apnsJwt && Date.now() - this.apnsJwt.issuedAt < 40 * 60_000) return this.apnsJwt.value;
    const value = this.jwt.sign(
      { iss: cfg.teamId, iat: Math.floor(Date.now() / 1000) },
      { privateKey: cfg.privateKey, algorithm: 'ES256', keyid: cfg.keyId },
    );
    this.apnsJwt = { value, issuedAt: Date.now() };
    return value;
  }

  private sendApns(deviceToken: string, msg: PushMessage) {
    const cfg = this.apnsConfig();
    if (!cfg) {
      this.logger.debug('APNs not configured; skipping iOS push');
      return Promise.resolve();
    }
    const host = cfg.production ? 'https://api.push.apple.com' : 'https://api.sandbox.push.apple.com';
    const payload = JSON.stringify({
      aps: { alert: { title: msg.title, body: msg.body }, sound: 'default' },
      ...(msg.data || {}),
      ...(msg.route ? { route: msg.route } : {}),
    });

    return new Promise<void>((resolveSend) => {
      let session: ClientHttp2Session | null = null;
      try {
        session = connect(host);
        session.on('error', (e) => {
          this.logger.warn(`APNs connection error: ${e.message}`);
          resolveSend();
        });
        const req = session.request({
          ':method': 'POST',
          ':path': `/3/device/${deviceToken}`,
          authorization: `bearer ${this.apnsAuthToken(cfg)}`,
          'apns-topic': cfg.bundleId,
          'apns-push-type': 'alert',
          'apns-priority': '10',
          'content-type': 'application/json',
        });
        let status = 0;
        let body = '';
        req.on('response', (headers) => (status = Number(headers[':status'])));
        req.setEncoding('utf8');
        req.on('data', (chunk) => (body += chunk));
        req.on('end', async () => {
          session?.close();
          if (status === 410 || /BadDeviceToken|Unregistered/.test(body)) {
            await this.prisma.deviceToken.deleteMany({ where: { token: deviceToken } });
          } else if (status !== 200) {
            this.logger.warn(`APNs send failed (${status}): ${body}`);
          }
          resolveSend();
        });
        req.end(payload);
      } catch (e) {
        session?.close();
        this.logger.warn(`APNs send failed: ${(e as Error).message}`);
        resolveSend();
      }
    });
  }
}
