// src/modules/invoices/invoices.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post('generate')
  generate(
    @Body()
    body: {
      leaseId: string;
      organizationId: string;
      year: number;
      month: number;
    },
  ) {
    return this.invoicesService.generateMonthlyInvoice(
      body.leaseId,
      body.organizationId,
      body.year,
      body.month,
    );
  }

  @Get('by-lease/:leaseId')
  findByLease(
    @Param('leaseId', ParseUUIDPipe) leaseId: string,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    return this.invoicesService.findByLease(leaseId, organizationId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    return this.invoicesService.findOne(id, organizationId);
  }
}