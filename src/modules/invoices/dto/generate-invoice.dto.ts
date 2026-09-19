// src/modules/invoices/dto/generate-invoice.dto.ts
import { IsUUID, IsNotEmpty, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateInvoiceDto {
  @ApiProperty({
    example: '9f00f10c-30c4-47ab-a95d-dc36c67e3af8',
    description: 'Active Lease UUID',
  })
  @IsUUID()
  @IsNotEmpty()
  leaseId: string;

  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'Organization UUID',
  })
  @IsUUID()
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty({ example: 2026, description: 'Billing Year' })
  @IsInt()
  @Min(2020)
  @IsNotEmpty()
  year: number;

  @ApiProperty({ example: 11, description: 'Billing Month (1 - 12)' })
  @IsInt()
  @Min(1)
  @Max(12)
  @IsNotEmpty()
  month: number;
}