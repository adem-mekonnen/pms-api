// src/modules/properties/dto/create-property.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  IsUUID,
} from 'class-validator';
import { PropertyType } from '../entities/property.entity';

export class CreatePropertyDto {
  // BRD BR-ORG-01: Multi-tenancy key
  @IsUUID()
  @IsNotEmpty()
  organizationId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(PropertyType, {
    message: 'type must be RESIDENTIAL, COMMERCIAL, or MIXED_USE',
  })
  @IsNotEmpty()
  type: PropertyType;

  // Ethiopian Address Structure (FR-PROP-001)
  @IsString()
  @IsNotEmpty()
  region: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  subCity: string;

  @IsString()
  @IsNotEmpty()
  woredaKebele: string;

  @IsString()
  @IsOptional()
  landmark?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  totalFloors?: number;

  @IsString()
  @IsOptional()
  description?: string;
}