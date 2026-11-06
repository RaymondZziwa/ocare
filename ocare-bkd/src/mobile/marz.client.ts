import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

export type MarzStatus = 'pending' | 'successful' | 'failed';

export interface MarzStartResult {
  reference: string;
  providerUuid: string | null;
  status: MarzStatus;
  message?: string;
}

/** Turns any Ugandan number format into 256XXXXXXXXX. Throws if it isn't a mobile number. */
export function normaliseUgPhone(input: string): string {
  const digits = String(input || '').replace(/\D/g, '');
  let local = digits;
  if (local.startsWith('256')) local = local.slice(3);
  if (local.startsWith('0')) local = local.slice(1);
  if (!/^7\d{8}$/.test(local)) {
    throw new BadRequestException('Enter a valid MTN or Airtel number, e.g. 0772 123456.');
  }
  return `256${local}`;
}

/** MTN or Airtel from the number prefix (used for display only). */
export function networkFor(phone256: string): 'MTN' | 'AIRTEL' | null {
  const p = phone256.slice(3, 5);
  if (['76', '77', '78', '79'].includes(p)) return 'MTN';
  if (['70', '74', '75'].includes(p)) return 'AIRTEL';
  return null;
}

/** Marz reports many words for the same outcome; reduce them to three. */
export function mapMarzStatus(raw: unknown): MarzStatus {
  const s = String(raw || '').toLowerCase();
  if (['success', 'successful', 'completed', 'complete', 'paid', 'succeeded'].includes(s)) return 'successful';
  if (['failed', 'failure', 'cancelled', 'canceled', 'rejected', 'declined', 'expired', 'timeout', 'error', 'reversed'].includes(s))
    return 'failed';
  return 'pending';
}

/**
 * Thin client for Marz Pay: collect money from a customer's phone, send money to a
 * phone (refunds), and look up a collection. Uses the MARZ_* settings already in .env.
 */
@Injectable()
export class MarzClient {
  private readonly logger = new Logger(MarzClient.name);

  constructor(private readonly config: ConfigService) {}

  private headers() {
    const auth = this.config.get<string>('MARZ_AUTH_HEADER');
    if (!auth) throw new BadRequestException('Mobile money is not set up yet. Please choose another way to pay.');
    return { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json', Accept: 'application/json' };
  }

  private callbackUrl() {
    // A dedicated URL can be set; otherwise the existing MARZ_CALLBACK_URL is used.
    return this.config.get<string>('MARZ_APP_CALLBACK_URL') || this.config.getOrThrow<string>('MARZ_CALLBACK_URL');
  }

  private async post(url: string, body: Record<string, unknown>) {
    let res: Awaited<ReturnType<typeof fetch>>;
    try {
      res = await fetch(url, { method: 'POST', headers: this.headers(), body: JSON.stringify(body) });
    } catch (err) {
      this.logger.error(`Marz request failed: ${(err as Error).message}`);
      throw new BadRequestException("We couldn't reach the mobile money service. Please try again.");
    }
    const json = (await res.json().catch(() => ({}))) as any;
    if (!res.ok || String(json?.status || '').toLowerCase() === 'error') {
      this.logger.warn(`Marz ${res.status}: ${JSON.stringify(json).slice(0, 500)}`);
      const msg = json?.message || json?.error || 'Mobile money request was declined.';
      throw new BadRequestException(typeof msg === 'string' ? msg : 'Mobile money request was declined.');
    }
    return json;
  }

  /** Sends a payment prompt to the customer's phone. */
  async collect(amount: number, phone256: string, description: string, reference: string = randomUUID()): Promise<MarzStartResult> {
    const json = await this.post(this.config.getOrThrow<string>('MARZ_COLLECTION_BASE_URL'), {
      amount: Math.round(amount),
      country: 'UG',
      reference,
      description: description.slice(0, 100),
      phone_number: phone256,
      callback_url: this.callbackUrl(),
    });
    const tx = json?.data?.transaction || {};
    return {
      reference,
      providerUuid: tx.uuid || json?.data?.collection_id || null,
      status: mapMarzStatus(tx.status),
      message: json?.message,
    };
  }

  /** Sends money to a customer's phone (used for mobile money refunds). */
  async send(amount: number, phone256: string, description: string, reference: string = randomUUID()): Promise<MarzStartResult> {
    const url = this.config.get<string>('MARZ_MOMO_PAYMENT_URL');
    if (!url) throw new BadRequestException('Mobile money refunds are not set up. Refund to the Ocare Wallet instead.');
    const json = await this.post(url, {
      amount: Math.round(amount),
      country: 'UG',
      reference,
      description: description.slice(0, 100),
      phone_number: phone256,
      callback_url: this.callbackUrl(),
    });
    const tx = json?.data?.transaction || {};
    return { reference, providerUuid: tx.uuid || null, status: mapMarzStatus(tx.status), message: json?.message };
  }

  /**
   * Asks Marz for the latest state of a collection. Used when a callback is late.
   * Returns null if Marz can't be asked (we then simply wait for the callback).
   */
  async collectionStatus(providerUuid: string): Promise<MarzStatus | null> {
    try {
      const base = this.config.getOrThrow<string>('MARZ_COLLECTION_BASE_URL').replace(/\/+$/, '');
      const res = await fetch(`${base}/${encodeURIComponent(providerUuid)}`, { headers: this.headers() });
      if (!res.ok) return null;
      const json = (await res.json().catch(() => ({}))) as any;
      const raw = json?.data?.transaction?.status ?? json?.data?.status ?? json?.transaction?.status;
      return raw ? mapMarzStatus(raw) : null;
    } catch {
      return null;
    }
  }
}
