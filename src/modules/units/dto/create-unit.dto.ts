// src/modules/units/dto/create-unit.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsInt,
  IsBoolean,
  Min,
  IsUUID,
} from 'class-validator';
import { UnitType, UnitStatus } from '../entities/unit.entity';

export class CreateUnitDto {
  @IsUUID()
  @IsNotEmpty()
  organizationId: string;

  @IsUUID()
  @IsNotEmpty()
  propertyId: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(UnitType)
  @IsOptional()
  type?: UnitType;

  @IsEnum(UnitStatus)
  @IsOptional()
  status?: UnitStatus;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsNotEmpty()
  marketRent: number;

  @IsInt()
  @IsOptional()
  floorNumber?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  sizeSqm?: number;

  @IsInt()
  @IsOptional()
  totalRooms?: number;

  @IsInt()
  @IsOptional()
  bedrooms?: number;

  @IsInt()
  @IsOptional()
  bathrooms?: number;

  @IsBoolean()
  @IsOptional()
  isFurnished?: boolean;
}