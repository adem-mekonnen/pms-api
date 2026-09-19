// src/modules/payments/payments.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

// Clean Enterprise Path Aliases (@modules/*)
import { Payment, PaymentMethod, PaymentStatus } from '@modules/payments/entities/payment.entity';
import { Invoice, InvoiceStatus } from '@modules/invoices/entities/invoice.entity';
import { RecordManualPaymentDto } from '@modules/payments/dto/record-manual-payment.dto';
import { ChapaService } from '@modules/payments/chapa.service';
import { AuditService } from '@modules/audit/audit.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly chapaService: ChapaService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  // 1. Manual Cash / Bank Transfer Payment (ACID Transaction)
  async recordManualPayment(dto: RecordManualPaymentDto): Promise<{
    payment: Payment;
    invoice: Invoice;
    remainingBalance: number;
  }> {
    return await this.dataSource.transaction(async (manager) => {
      const invoice = await manager.findOne(Invoice, {
        where: { id: dto.invoiceId, organizationId: dto.organizationId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!invoice) {
        throw new NotFoundException('Invoice not found in this organization.');
      }

      if (invoice.status === InvoiceStatus.PAID) {
        throw new BadRequestException('This invoice has already been fully paid.');
      }

      if (invoice.status === InvoiceStatus.CANCELLED) {
        throw new BadRequestException('Cannot record payment for a cancelled invoice.');
      }

      const totalAmount = Number(invoice.totalAmount);
      const currentPaid = Number(invoice.amountPaid);
      const outstandingBalance = Number((totalAmount - currentPaid).toFixed(2));

      if (dto.amount > outstandingBalance) {
        throw new BadRequestException(
          `Payment amount (${dto.amount} ETB) exceeds outstanding invoice balance (${outstandingBalance} ETB).`,
        );
      }

      const payment = manager.create(Payment, {
        organizationId: dto.organizationId,
        invoiceId: dto.invoiceId,
        amount: dto.amount,
        method: dto.method,
        status: PaymentStatus.SUCCESSFUL,
        reference: dto.reference,
        paymentDate: dto.paymentDate,
        receiptUrl: dto.receiptUrl,
      });
      await manager.save(Payment, payment);

      const newAmountPaid = Number((currentPaid + dto.amount).toFixed(2));
      const remainingBalance = Number((totalAmount - newAmountPaid).toFixed(2));

      invoice.amountPaid = newAmountPaid;
      invoice.status = remainingBalance === 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;
      await manager.save(Invoice, invoice);

      // Stamping Immutable Audit Log (BR-AUD-01, Section 33)
      await this.auditService.logAction({
        organizationId: dto.organizationId,
        action: 'MANUAL_PAYMENT_RECORDED',
        entity: 'Payment',
        entityId: payment.id,
        afterState: {
          amount: dto.amount,
          method: dto.method,
          invoiceNumber: invoice.invoiceNumber,
          remainingBalance,
        },
      });

      return {
        payment,
        invoice,
        remainingBalance,
      };
    });
  }

  // 2. Initialize Online Rent Payment with Chapa (UC-14, UC-15)
  async initializeChapaPayment(invoiceId: string, organizationId: string) {
    const invoice = await this.dataSource.getRepository(Invoice).findOne({
      where: { id: invoiceId, organizationId },
      relations: { lease: { tenant: true, property: true } },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found in this organization.');
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('This invoice has already been fully paid.');
    }

    const outstandingBalance = Number(
      (Number(invoice.totalAmount) - Number(invoice.amountPaid)).toFixed(2),
    );

    const tenant = invoice.lease?.tenant;
    const txRef = `TX-${invoice.invoiceNumber}-${Date.now()}`;

    // Clean Ethiopian Phone format: Chapa requires 10 digits (09... or 07...)
    let cleanPhone = (tenant?.phone || '0911223344')
      .replace('+251', '0')
      .replace(/^251/, '0')
      .replace(/\s+/g, '');
    if (!cleanPhone.startsWith('0')) {
      cleanPhone = `0${cleanPhone}`;
    }

    // Ensure email uses a real domain (Chapa validates MX records)
    let email = tenant?.email || 'customer@gmail.com';
    if (!email || email.includes('example.com') || email.includes('abcpms.com')) {
      email = 'customer@gmail.com';
    }

    const chapaResponse = await this.chapaService.initializePayment({
      amount: outstandingBalance,
      currency: 'ETB',
      email: email,
      firstName: tenant?.firstName || 'Abebe',
      lastName: tenant?.lastName || 'Bikila',
      phone: cleanPhone,
      txRef,
      returnUrl: 'http://localhost:3000/api/v1/health',
      customization: {
        title: `Rent: ${invoice.invoiceNumber}`,
        description: `Rent payment for ${invoice.lease?.property?.name || 'Property'}`,
      },
    });

    return {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      amountToPay: outstandingBalance,
      currency: 'ETB',
      txRef,
      checkoutUrl: chapaResponse.data?.checkout_url,
    };
  }

  // 3. Process Chapa Asynchronous Webhook (BR-PAY-03, BR-PAY-04)
  async handleChapaWebhook(payload: any, signature: string) {
    const expectedSecret = this.configService.get<string>('CHAPA_WEBHOOK_SECRET');

    // Security Check: Verify secret signature hash
    if (signature !== expectedSecret) {
      throw new UnauthorizedException('Invalid webhook signature.');
    }

    const { tx_ref, status } = payload;
    if (status !== 'success') {
      return { received: true, status: 'ignored' };
    }

    return await this.verifyChapaPayment(tx_ref);
  }

  // 4. Verify Chapa Payment and Finalize Invoice (BR-PAY-03, UC-18, UC-19)
  async verifyChapaPayment(txRef: string) {
    // 1. Independently verify with Chapa API (BR-PAY-03)
    const verification = await this.chapaService.verifyPayment(txRef);

    if (verification.status !== 'success') {
      throw new BadRequestException('Payment verification failed on Chapa.');
    }

    const verifiedData = verification.data;
    const verifiedAmount = Number(verifiedData.amount);

    // Extract invoice number from txRef (e.g. TX-INV-202611-0002-1789...)
    const parts = txRef.split('-');
    const invoiceNumber = `${parts[1]}-${parts[2]}-${parts[3]}`;

    // 2. ACID Transaction to mark Invoice PAID & save Payment record
    return await this.dataSource.transaction(async (manager) => {
      const invoice = await manager.findOne(Invoice, {
        where: { invoiceNumber },
        lock: { mode: 'pessimistic_write' },
      });

      if (!invoice) {
        throw new NotFoundException(`Invoice "${invoiceNumber}" not found.`);
      }

      // Idempotency: If already finalized, exit gracefully (BR-PAY-04 / AC-05)
      if (invoice.status === InvoiceStatus.PAID) {
        return {
          message: 'Invoice is already marked as PAID.',
          invoice,
        };
      }

      // Record the confirmed payment
      const payment = manager.create(Payment, {
        organizationId: invoice.organizationId,
        invoiceId: invoice.id,
        amount: verifiedAmount,
        method: PaymentMethod.CHAPA,
        status: PaymentStatus.SUCCESSFUL,
        reference: txRef,
        paymentDate: new Date().toISOString().split('T')[0],
      });
      await manager.save(Payment, payment);

      // Update Invoice status to PAID
      invoice.amountPaid = Number((Number(invoice.amountPaid) + verifiedAmount).toFixed(2));
      if (invoice.amountPaid >= Number(invoice.totalAmount)) {
        invoice.status = InvoiceStatus.PAID;
      }
      await manager.save(Invoice, invoice);

      // Stamping Immutable Audit Log for Online Chapa Payment (BR-AUD-01, Section 33)
      await this.auditService.logAction({
        organizationId: invoice.organizationId,
        action: 'CHAPA_PAYMENT_VERIFIED',
        entity: 'Payment',
        entityId: payment.id,
        afterState: {
          amount: verifiedAmount,
          txRef,
          invoiceNumber: invoice.invoiceNumber,
          invoiceStatus: invoice.status,
        },
      });

      return {
        success: true,
        status: 'PAID',
        verifiedAmount,
        invoiceNumber: invoice.invoiceNumber,
        invoice,
      };
    });
  }

  async findByInvoice(invoiceId: string, organizationId: string): Promise<Payment[]> {
    return await this.dataSource.getRepository(Payment).find({
      where: { invoiceId, organizationId },
      order: { createdAt: 'DESC' },
    });
  }
}