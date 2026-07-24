import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['profile', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: {
      id: string;
      name: { givenName: string; familyName: string };
      email: string;
      emails: string[];
      photos: string[];
      email_verified: boolean;
    },
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, email, email_verified, photos } = profile;

    const user = {
      provider: 'google',
      providerId: id,
      email,
      fullName: `${name.givenName} ${name.familyName}`,
      firstName: name.familyName,
      lastName: name.givenName,
      picture: photos[0],
      isEmailVerified: email_verified,
    };
    done(null, user);
  }
}
