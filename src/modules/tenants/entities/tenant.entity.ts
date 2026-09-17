// src/modules/tenants/entities/tenant.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

export enum TenantStatus {
  PROSPECTIVE = 'PROSPECTIVE',
  ACTIVE = 'ACTIVE',
  FORMER = 'FORMER',
}

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Multi-tenancy isolation (BR-ORG-01, BR-TEN-01)
  @Index()
  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 30 })
  phone: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  occupation?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  employer?: string;

  @Column({
    type: 'enum',
    enum: TenantStatus,
    default: TenantStatus.PROSPECTIVE,
  })
  status: TenantStatus;

  // Ethiopian Address Structure (FR-TEN-002)
  @Column({ type: 'varchar', length: 100, nullable: true })
  region?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  subCity?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  woredaKebele?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  houseNumber?: string;

  // Emergency Contact (FR-TEN-003)
  @Column({ type: 'varchar', length: 150, nullable: true })
  emergencyContactName?: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  emergencyContactPhone?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  emergencyContactRelation?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  // Data Retention Policy (BR-DATA-01, Section 31.1)
  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedAt?: Date;
}