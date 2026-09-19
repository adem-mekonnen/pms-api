// src/modules/payments/payments.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

// Clean Enterprise Path Aliases
import { PaymentsService } from '@modules/payments/payments.service';
import { RecordManualPaymentDto } from '@modules/payments/dto/record-manual-payment.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentOrg } from '@common/decorators/current-org.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // 1. Authenticated: Record manual cash / bank transfer payment
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('manual')
  @ApiOperation({ summary: 'Record a manual cash or bank transfer payment' })
  @ApiResponse({ status: 201, description: 'Payment recorded and invoice updated.' })
  recordManualPayment(@Body() dto: RecordManualPaymentDto) {
    return this.paymentsService.recordManualPayment(dto);
  }

  // 2. Authenticated: Generate Chapa checkout link (UC-14, UC-15)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('chapa/initialize/:invoiceId')
  @ApiOperation({ summary: 'Initialize online payment via Chapa (returns checkout URL)' })
  @ApiResponse({ status: 201, description: 'Chapa checkout URL created.' })
  initializeChapa(
    @Param('invoiceId', ParseUUIDPipe) invoiceId: string,
    @CurrentOrg() organizationId: string,
  ) {
    return this.paymentsService.initializeChapaPayment(invoiceId, organizationId);
  }

  // 3. PUBLIC: Verify Chapa Transaction and Mark Invoice as PAID (BR-PAY-03, UC-18, UC-19)
  @Get('chapa/verify/:txRef')
  @ApiOperation({ summary: 'Verify Chapa transaction and mark invoice as PAID (BR-PAY-03)' })
  @ApiResponse({ status: 200, description: 'Payment verified and invoice marked PAID.' })
  verifyChapaPayment(@Param('txRef') txRef: string) {
    return this.paymentsService.verifyChapaPayment(txRef);
  }

  // 4. PUBLIC: Chapa Webhook Receiver (called directly by Chapa server)
  @Post('chapa/webhook')
  @ApiOperation({ summary: 'Chapa webhook receiver (authenticates via signature hash)' })
  @ApiResponse({ status: 200, description: 'Webhook processed and invoice marked PAID.' })
  chapaWebhook(
    @Body() payload: any,
    @Headers('x-chapa-signature') signature: string,
  ) {
    return this.paymentsService.handleChapaWebhook(payload, signature);
  }

  // 5. Authenticated: Fetch payment history for an invoice
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('by-invoice/:invoiceId')
  @ApiOperation({ summary: 'Get all payments recorded for an invoice' })
  @ApiResponse({ status: 200, description: 'List of recorded payments.' })
  findByInvoice(
    @Param('invoiceId', ParseUUIDPipe) invoiceId: string,
    @CurrentOrg() organizationId: string,
  ) {
    return this.paymentsService.findByInvoice(invoiceId, organizationId);
  }
}