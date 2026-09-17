// src/common/decorators/permissions.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Permission } from '@common/enums/permissions.enum'; // Using our alias!

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);