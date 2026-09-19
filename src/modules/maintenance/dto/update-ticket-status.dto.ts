// src/modules/maintenance/dto/update-ticket-status.dto.ts
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from '../entities/maintenance-ticket.entity';

export class UpdateTicketStatusDto {
  @ApiProperty({ enum: TicketStatus, example: TicketStatus.IN_PROGRESS })
  @IsEnum(TicketStatus)
  @IsNotEmpty()
  status: TicketStatus;

  @ApiProperty({ example: 'Ato Daniel (Plumber)', required: false })
  @IsString()
  @IsOptional()
  assignedTo?: string;

  @ApiProperty({ example: 'Replaced the rubber gasket and tightened the pipe valve.', required: false })
  @IsString()
  @IsOptional()
  resolutionNotes?: string;
}