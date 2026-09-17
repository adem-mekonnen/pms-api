// src/modules/leases/dto/create-lease.dto.ts
import {
  IsUUID,
  IsNotEmpty,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsNumber,
  IsArray,
  ArrayNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateLeaseDto {
  @IsUUID()
  @IsNotEmpty()
  organizationId: string;

  @IsUUID()
  @IsNotEmpty()
  propertyId: string;

  @IsUUID()
  @IsNotEmpty()
  tenantId: string;

  // Array of Unit UUIDs attached to this lease (BR-LEASE-06)
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  unitIds: string[];

  @IsDateString()
  @IsNotEmpty()
  startDate: string; // e.g. "2026-10-01"

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  durationMonths: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsNotEmpty()
  monthlyRent: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  vatRate?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  securityDeposit?: number;

  @IsInt()
  @Min(1)
  @Max(28)
  @IsNotEmpty()
  rentDueDay: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  lateFeePercentage?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  advanceBalance?: number;
}