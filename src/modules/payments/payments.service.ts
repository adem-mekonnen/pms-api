// src/modules/payments/payments.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';
import { RecordManualPaymentDto } from './dto/record-manual-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly dataSource: DataSource) {}

  async recordManualPayment(dto: RecordManualPaymentDto): Promise<{
    payment: Payment;
    invoice: Invoice;
    remainingBalance: number;
  }> {
    // Section 44.8: Execute inside an ACID database transaction
    return await this.dataSource.transaction(async (manager) => {
      // 1. Fetch the invoice with a pessimistic row-lock to prevent race conditions
      const invoice = await manager.findOne(Invoice, {
        where: { id: dto.invoiceId, organizationId: dto.organizationId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!invoice) {
        throw new NotFoundException('Invoice not found in this organization.');
      }

      // BR-INV-03: Immutable check
      if (invoice.status === InvoiceStatus.PAID) {
        throw new BadRequestException('This invoice has already been fully paid.');
      }

      if (invoice.status === InvoiceStatus.CANCELLED) {
        throw new BadRequestException('Cannot record payment for a cancelled invoice.');
      }

      const totalAmount = Number(invoice.totalAmount);
      const currentPaid = Number(invoice.amountPaid);
      const outstandingBalance = Number((totalAmount - currentPaid).toFixed(2));

      // Validation: Check for overpayment
      if (dto.amount > outstandingBalance) {
        throw new BadRequestException(
          `Payment amount (${dto.amount} ETB) exceeds outstanding invoice balance (${outstandingBalance} ETB).`,
        );
      }

      // 2. Create and persist the Payment record
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

      // 3. Update Invoice totals and lifecycle status (BR-PAY-02)
      const newAmountPaid = Number((currentPaid + dto.amount).toFixed(2));
      const remainingBalance = Number((totalAmount - newAmountPaid).toFixed(2));

      invoice.amountPaid = newAmountPaid;

      if (remainingBalance === 0) {
        invoice.status = InvoiceStatus.PAID;
      } else {
        invoice.status = InvoiceStatus.PARTIALLY_PAID;
      }

      await manager.save(Invoice, invoice);

      return {
        payment,
        invoice,
        remainingBalance,
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