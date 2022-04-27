import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { NaytradingService } from 'src/naytrading/NaytradingService';
import { User } from '../auth/user.entity';
import { AuthResponse } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    public readonly userRepository: EntityRepository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly naytradingService: NaytradingService
  ) {}

  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.naytradingService.login(email, password);

    if (!user) {
      return null;
    }

    //naytradingStore.setPassword(email, password);

    return {
      _id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      id: user.id.toString(),
      username: user.username,
      isAdmin: user.isAdmin,
      password: undefined,
      name: undefined
    };
  }

  forceAdminByConfig(user: User) {
    if (this.isAdmin(user)) {
      user.isAdmin = true;
    }
  }

  private isAdmin(user: User) {
    return (
      this.configService
        .get('ADMINS')
        ?.split(';')
        .indexOf(user.username) >= 0
    );
  }

  login(user: User): AuthResponse {
    const payload = {
      username: user.username,
      sub: user.id,
      isAdmin: user.isAdmin
    };
    return {
      idToken: this.jwtService.sign(payload)
    };
  }
}
