// src/modules/invoices/invoices.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Invoice,
  InvoiceStatus,
  InvoiceItem,
  InvoiceItemType,
} from './entities/invoice.entity'; //  All imported from invoice.entity
import { Lease, LeaseStatus } from '../leases/entities/lease.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
    @InjectRepository(Lease)
    private readonly leaseRepository: Repository<Lease>,
  ) {}

  async generateMonthlyInvoice(
    leaseId: string,
    organizationId: string,
    billingYear: number,
    billingMonth: number, // 1 to 12
  ): Promise<Invoice> {
    const lease = await this.leaseRepository.findOne({
      where: { id: leaseId, organizationId },
      relations: { tenant: true, property: true },
    });

    if (!lease) throw new NotFoundException('Lease not found.');
    if (lease.status !== LeaseStatus.ACTIVE) {
      throw new BadRequestException('Cannot generate invoice for a non-active lease.');
    }

    // 1. Calculate Period Start & End (Gregorian months per BR-FIN-01)
    const startDate = new Date(Date.UTC(billingYear, billingMonth - 1, 1));
    const endDate = new Date(Date.UTC(billingYear, billingMonth, 0)); // Last day of month

    const periodStartStr = startDate.toISOString().split('T')[0];
    const periodEndStr = endDate.toISOString().split('T')[0];

    // 2. Idempotency Check: Prevent duplicate billing (Section 44.5)
    const existingInvoice = await this.invoiceRepository.findOne({
      where: {
        leaseId,
        billingPeriodStart: periodStartStr,
        billingPeriodEnd: periodEndStr,
      },
    });

    if (existingInvoice) {
      throw new ConflictException(
        `Invoice already exists for period ${periodStartStr} to ${periodEndStr}.`,
      );
    }

    // 3. Financial Calculations (BR-FIN-01 & BR-FIN-02)
    const monthlyRent = Number(lease.monthlyRent);
    const vatRate = Number(lease.vatRate) / 100;
    const vatAmount = Number((monthlyRent * vatRate).toFixed(2));
    const totalAmount = Number((monthlyRent + vatAmount).toFixed(2));

    // Due Date: based on lease.rentDueDay
    const dueDay = Math.min(lease.rentDueDay, endDate.getUTCDate());
    const dueDateStr = new Date(Date.UTC(billingYear, billingMonth - 1, dueDay))
      .toISOString()
      .split('T')[0];

    // 4. Generate Sequential Invoice Number: ORG-YYYYMM-{count} (BR-INV-01)
    const invoiceCount = await this.invoiceRepository.count({ where: { organizationId } });
    const invoiceNumber = `INV-${billingYear}${String(billingMonth).padStart(2, '0')}-${String(invoiceCount + 1).padStart(4, '0')}`;

    // 5. Create Line Items
    const rentItem = new InvoiceItem();
    rentItem.type = InvoiceItemType.RENT;
    rentItem.description = `Monthly Rent for ${periodStartStr} - ${periodEndStr}`;
    rentItem.amount = monthlyRent;

    const items: InvoiceItem[] = [rentItem];

    if (vatAmount > 0) {
      const vatItem = new InvoiceItem();
      vatItem.type = InvoiceItemType.VAT;
      vatItem.description = `VAT (${lease.vatRate}%)`;
      vatItem.amount = vatAmount;
      items.push(vatItem);
    }

    // 6. Build and Save Invoice
    const invoice = this.invoiceRepository.create({
      organizationId,
      leaseId,
      invoiceNumber,
      billingPeriodStart: periodStartStr,
      billingPeriodEnd: periodEndStr,
      dueDate: dueDateStr,
      subtotal: monthlyRent,
      vatAmount,
      lateFee: 0.0,
      totalAmount,
      amountPaid: 0.0,
      status: InvoiceStatus.ISSUED,
      items,
    });

    return await this.invoiceRepository.save(invoice);
  }

  async findByLease(leaseId: string, organizationId: string): Promise<Invoice[]> {
    return await this.invoiceRepository.find({
      where: { leaseId, organizationId },
      relations: { items: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, organizationId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id, organizationId },
      relations: { items: true, lease: { tenant: true, property: true } },
    });
    if (!invoice) throw new NotFoundException(`Invoice with ID "${id}" was not found.`);
    return invoice;
  }
}