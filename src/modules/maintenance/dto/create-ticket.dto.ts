// src/modules/maintenance/dto/create-ticket.dto.ts
import { IsUUID, IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketCategory, TicketPriority } from '../entities/maintenance-ticket.entity';

export class CreateTicketDto {
  @ApiProperty({ example: '8dddba99-03b5-4fb1-89bd-7e94b27256f1', description: 'Unit UUID' })
  @IsUUID()
  @IsNotEmpty()
  unitId: string;

  @ApiProperty({ example: '552394ea-891e-4022-8b84-81d5c30dd837', description: 'Tenant UUID' })
  @IsUUID()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty({ example: 'Water pipe leaking under kitchen sink', description: 'Short summary' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ enum: TicketCategory, example: TicketCategory.PLUMBING })
  @IsEnum(TicketCategory)
  @IsNotEmpty()
  category: TicketCategory;

  @ApiProperty({ enum: TicketPriority, example: TicketPriority.URGENT, required: false })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @ApiProperty({ example: 'The pipe under the sink started leaking heavily this morning.', description: 'Details' })
  @IsString()
  @IsNotEmpty()
  description: string;
}