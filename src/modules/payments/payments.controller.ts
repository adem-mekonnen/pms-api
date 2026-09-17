// src/modules/payments/payments.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { RecordManualPaymentDto } from './dto/record-manual-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('manual')
  recordManualPayment(@Body() dto: RecordManualPaymentDto) {
    return this.paymentsService.recordManualPayment(dto);
  }

  @Get('by-invoice/:invoiceId')
  findByInvoice(
    @Param('invoiceId', ParseUUIDPipe) invoiceId: string,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    return this.paymentsService.findByInvoice(invoiceId, organizationId);
  }
}