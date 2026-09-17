// src/common/decorators/current-org.decorator.ts
import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const CurrentOrg = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.organizationId) {
      throw new UnauthorizedException('No organization context found in session token.');
    }

    return user.organizationId;
  },
);