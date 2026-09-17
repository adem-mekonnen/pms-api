// src/modules/tenants/dto/create-tenant.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { TenantStatus } from '../entities/tenant.entity';

export class CreateTenantDto {
  @IsUUID()
  @IsNotEmpty()
  organizationId: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  occupation?: string;

  @IsString()
  @IsOptional()
  employer?: string;

  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;

  // Address
  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  subCity?: string;

  @IsString()
  @IsOptional()
  woredaKebele?: string;

  @IsString()
  @IsOptional()
  houseNumber?: string;

  // Emergency Contact
  @IsString()
  @IsOptional()
  emergencyContactName?: string;

  @IsString()
  @IsOptional()
  emergencyContactPhone?: string;

  @IsString()
  @IsOptional()
  emergencyContactRelation?: string;
}