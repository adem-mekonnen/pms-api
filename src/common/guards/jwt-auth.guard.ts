// src/common/guards/jwt-auth.guard.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      // info?.message shows the exact reason (e.g. 'invalid signature', 'jwt expired')
      throw err || new UnauthorizedException(info?.message || 'Authentication token is missing or invalid.');
    }
    return user;
  }
}