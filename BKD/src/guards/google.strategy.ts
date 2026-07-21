import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow('CLIENT_ID'),
      clientSecret: configService.getOrThrow('CLIENT_SECRET'),
      callbackURL: configService.getOrThrow('GOOGLE_CALLBAKC_URL'),
      scope: ['profile', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: { id: string; name: string; emails: string[]; photos: string[] },
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    const user = {
      provider: 'google',
      providerId: id,
      email: emails[0],
      // fullName: `${name.givenName} ${name.familyName}`,
      // firstName: name.familyName,
      // lastName: name.givenName,
      picture: photos[0],
    };

    console.log('google profile', profile)
    console.log('user');
    done(null, user);
  }
}
