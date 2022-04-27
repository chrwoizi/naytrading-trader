import {
  createParamDecorator,
  ExecutionContext,
  Injectable
} from '@nestjs/common';
import { AuthAccessGuard } from '../auth/auth-access.guard';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const IsAdmin = createParamDecorator((data, req) => {
  return req.isAdmin;
});

@Injectable()
export class AdminAccessGuard extends AuthAccessGuard {
  async canActivate(context: ExecutionContext) {
    const request = this.getRequest(context);
    try {
      const result = await super.canActivate(context);
      if (!result) return false;
      request.isAdmin = request.user.isAdmin;
      return request.isAdmin;
    } catch {
      request.isAdmin = false;
    }
    return false;
  }
}
