// src/modules/payments/entities/payment.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  VersionColumn,
} from 'typeorm';
import { Invoice } from '../../invoices/entities/invoice.entity';

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHAPA = 'CHAPA',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  RECONCILIATION_FLAGGED = 'RECONCILIATION_FLAGGED',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Multi-tenancy key (BR-ORG-01)
  @Index()
  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid' })
  invoiceId: string;

  @ManyToOne(() => Invoice, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column({ type: 'numeric', precision: 18, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.BANK_TRANSFER,
  })
  method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.SUCCESSFUL,
  })
  status: PaymentStatus;

  // e.g., CBE or Awash Bank transaction reference number
  @Column({ type: 'varchar', length: 100, nullable: true })
  reference?: string;

  @Column({ type: 'date' })
  paymentDate: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  receiptUrl?: string;

  @VersionColumn()
  version: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}