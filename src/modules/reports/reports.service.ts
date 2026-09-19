// src/modules/reports/reports.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';

// Clean Enterprise Path Aliases
import { Property, PropertyStatus } from '@modules/properties/entities/property.entity';
import { Unit, UnitStatus } from '@modules/units/entities/unit.entity';
import { Lease, LeaseStatus } from '@modules/leases/entities/lease.entity';
import { Invoice, InvoiceStatus } from '@modules/invoices/entities/invoice.entity';
import { Payment, PaymentStatus } from '@modules/payments/entities/payment.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
    @InjectRepository(Unit)
    private readonly unitRepo: Repository<Unit>,
    @InjectRepository(Lease)
    private readonly leaseRepo: Repository<Lease>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  // FR-RPT-001: Owner Dashboard Real-Time Portfolio Analytics
  async getDashboardSummary(organizationId: string) {
    // 1. Total Properties
    const totalProperties = await this.propertyRepo.count({
      where: { organizationId, status: PropertyStatus.ACTIVE },
    });

    // 2. Unit Occupancy & Vacancy (Section 28 Formula)
    const totalUnits = await this.unitRepo.count({ where: { organizationId } });
    const occupiedUnits = await this.unitRepo.count({
      where: { organizationId, status: UnitStatus.OCCUPIED },
    });
    const vacantUnits = totalUnits - occupiedUnits;
    const occupancyRate =
      totalUnits > 0
        ? Number(((occupiedUnits / totalUnits) * 100).toFixed(2))
        : 0;

    // 3. Active Leases & Leases Expiring Soon (within next 30 days)
    const activeLeases = await this.leaseRepo.count({
      where: { organizationId, status: LeaseStatus.ACTIVE },
    });

    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);

    const leasesExpiringSoon = await this.leaseRepo.count({
      where: {
        organizationId,
        status: LeaseStatus.ACTIVE,
        endDate: Between(
          now.toISOString().split('T')[0],
          in30Days.toISOString().split('T')[0],
        ),
      },
    });

    // 4. Monthly Collection (ETB) - Current Calendar Month (Section 28 Formula)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];

    const monthlyPayments = await this.paymentRepo.find({
      where: {
        organizationId,
        status: PaymentStatus.SUCCESSFUL,
        paymentDate: Between(startOfMonth, endOfMonth),
      },
    });

    const monthlyCollectionETB = Number(
      monthlyPayments
        .reduce((sum, p) => sum + Number(p.amount), 0)
        .toFixed(2),
    );

    // 5. Total Outstanding Arrears (Unpaid or Partially Paid invoices)
    const outstandingInvoices = await this.invoiceRepo.find({
      where: {
        organizationId,
        status: In([InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE]),
      },
    });

    const outstandingArrearsETB = Number(
      outstandingInvoices
        .reduce(
          (sum, inv) => sum + (Number(inv.totalAmount) - Number(inv.amountPaid)),
          0,
        )
        .toFixed(2),
    );

    return {
      portfolio: {
        totalProperties,
        totalUnits,
        occupiedUnits,
        vacantUnits,
        occupancyRate: `${occupancyRate}%`,
      },
      leasing: {
        activeLeases,
        leasesExpiringSoon,
      },
      financials: {
        currency: 'ETB',
        monthlyCollectionThisMonth: monthlyCollectionETB,
        totalOutstandingArrears: outstandingArrearsETB,
      },
    };
  }
}