import { CanActivate, ExecutionContext } from '@nestjs/common';
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    console.log('rq',request.session.userId)
    return request.session.userId;
  }
}
