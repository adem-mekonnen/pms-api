// src/modules/leases/entities/lease.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  Index,
  VersionColumn,
} from 'typeorm';
import { Property } from '../../properties/entities/property.entity';
import { Unit } from '../../units/entities/unit.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';

export enum LeaseStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  TERMINATED = 'TERMINATED',
  EXPIRED = 'EXPIRED',
}

@Entity('leases')
export class Lease {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Multi-tenancy isolation (BR-ORG-01)
  @Index()
  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid' })
  propertyId: string;

  @ManyToOne(() => Property, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  // BRD Section 44.5: LeaseUnit join table supporting multiple units per lease
  @ManyToMany(() => Unit)
  @JoinTable({
    name: 'lease_units',
    joinColumn: { name: 'lease_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'unit_id', referencedColumnName: 'id' },
  })
  units: Unit[];

  // Dates stored in Gregorian/UTC (ISO-8601 per NFR-CAL-01)
  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ type: 'int' })
  durationMonths: number;

  // Financial fields with decimal-safe precision (BR-FIN-01, Section 44.5)
  @Column({ type: 'numeric', precision: 18, scale: 2 })
  monthlyRent: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0.0 })
  vatRate: number; // e.g. 15.00 for 15% VAT

  @Column({ type: 'numeric', precision: 18, scale: 2, default: 0.0 })
  securityDeposit: number;

  @Column({ type: 'int', default: 1 })
  rentDueDay: number; // Day of month (1-28)

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0.0 })
  lateFeePercentage: number; // e.g. 5.00%

  // Upfront tenant credit (BR-FIN-04)
  @Column({ type: 'numeric', precision: 18, scale: 2, default: 0.0 })
  advanceBalance: number;

  @Column({
    type: 'enum',
    enum: LeaseStatus,
    default: LeaseStatus.DRAFT,
  })
  status: LeaseStatus;

  // Optimistic locking (Section 44.5)
  @VersionColumn()
  version: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedAt?: Date;
}