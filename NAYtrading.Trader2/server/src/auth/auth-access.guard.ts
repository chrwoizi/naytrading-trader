import {
  createParamDecorator,
  ExecutionContext,
  Inject,
  Injectable
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const IsLoggedIn = createParamDecorator((data, req) => req.authorized);

@Injectable()
export class AuthAccessGuard extends AuthGuard('jwt') {
  constructor(@Inject(AuthService) private authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request = this.getRequest(context);
    try {
      const result = (await super.canActivate(context)) as boolean;

      request.authorized = true;
      return result;
    } catch (e) {
      console.log(e);
      request.authorized = false;
    }
    return false;
  }

  getRequest(context: ExecutionContext) {
    return context.switchToHttp().getRequest();
  }
}
