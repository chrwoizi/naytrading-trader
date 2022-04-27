import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigKey } from 'src/ConfigKey';
import { NaytradingModule } from 'src/naytrading/NaytradingModule';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { User } from './user.entity';
const passportModule = PassportModule.register({ defaultStrategy: 'jwt' });

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([User]),
    passportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: (() => {
          const secret = configService.get<string>(ConfigKey.JWT_SECRET);
          if (!(secret?.length > 0)) {
            throw new Error('JWT_SECRET is not set');
          }
          return secret;
        })(),
        signOptions: { expiresIn: '2 days' }
      }),
      inject: [ConfigService]
    }),
    NaytradingModule
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService, passportModule]
})
export class AuthModule {}
