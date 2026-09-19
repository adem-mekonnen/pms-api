// src/modules/invoices/entities/invoice.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Unique,
  VersionColumn,
} from 'typeorm';

// Clean Enterprise Alias
import { Lease } from '@modules/leases/entities/lease.entity';

// 1. ENUMS FIRST
export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum InvoiceItemType {
  RENT = 'RENT',
  VAT = 'VAT',
  SECURITY_DEPOSIT = 'SECURITY_DEPOSIT',
  LATE_FEE = 'LATE_FEE',
}

// 2. PARENT ENTITY (AGGREGATE ROOT)
@Entity('invoices')
// Section 44.5: Idempotency constraint - prevents duplicate billing for the same period
@Unique('UQ_lease_billing_period', ['leaseId', 'billingPeriodStart', 'billingPeriodEnd'])
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid' })
  leaseId: string;

  @ManyToOne(() => Lease, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'leaseId' })
  lease: Lease;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  invoiceNumber: string;

  @Column({ type: 'date' })
  billingPeriodStart: string;

  @Column({ type: 'date' })
  billingPeriodEnd: string;

  @Column({ type: 'date' })
  dueDate: string;

  @Column({ type: 'numeric', precision: 18, scale: 2 })
  subtotal: number;

  @Column({ type: 'numeric', precision: 18, scale: 2, default: 0.0 })
  vatAmount: number;

  @Column({ type: 'numeric', precision: 18, scale: 2, default: 0.0 })
  lateFee: number;

  @Column({ type: 'numeric', precision: 18, scale: 2 })
  totalAmount: number;

  @Column({ type: 'numeric', precision: 18, scale: 2, default: 0.0 })
  amountPaid: number;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.ISSUED,
  })
  status: InvoiceStatus;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
  items: InvoiceItem[];

  @VersionColumn()
  version: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedAt?: Date;
}

// 3. CHILD ENTITY (LINE ITEM)
@Entity('invoice_items')
export class InvoiceItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  invoiceId: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column({
    type: 'enum',
    enum: InvoiceItemType,
  })
  type: InvoiceItemType;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'numeric', precision: 18, scale: 2 })
  amount: number;
}