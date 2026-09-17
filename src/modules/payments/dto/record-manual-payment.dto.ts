// src/modules/payments/dto/record-manual-payment.dto.ts
import {
  IsUUID,
  IsNotEmpty,
  IsNumber,
  Min,
  IsEnum,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity';

export class RecordManualPaymentDto {
  @IsUUID()
  @IsNotEmpty()
  organizationId: string;

  @IsUUID()
  @IsNotEmpty()
  invoiceId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsNotEmpty()
  amount: number;

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  method: PaymentMethod;

  @IsDateString()
  @IsNotEmpty()
  paymentDate: string; // e.g. "2026-10-02"

  @IsString()
  @IsOptional()
  reference?: string; // e.g. "CBE-TX-987654321"

  @IsString()
  @IsOptional()
  receiptUrl?: string;
}