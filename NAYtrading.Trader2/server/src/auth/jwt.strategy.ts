import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigKey } from 'src/ConfigKey';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: (() => {
        const secret = configService.get<string>(ConfigKey.JWT_SECRET);
        if (!(secret?.length > 0)) {
          throw new Error('JWT_SECRET is not set');
        }
        return secret;
      })()
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      username: payload.username,
      isAdmin: payload.isAdmin
    };
  }
}
