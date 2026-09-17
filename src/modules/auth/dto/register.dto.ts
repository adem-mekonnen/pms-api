// src/modules/auth/dto/register.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength, IsUUID } from 'class-validator';

export class RegisterDto {
  @IsUUID()
  @IsNotEmpty()
  organizationId: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  // FR-USER-005: Minimum password policy
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;
}