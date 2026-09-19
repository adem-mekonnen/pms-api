// src/modules/audit/entities/audit-log.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Multi-tenancy key (BR-ORG-01)
  @Index()
  @Column({ type: 'uuid' })
  organizationId: string;

  // Who performed the action? (UUID from authenticated User, nullable for system automation)
  @Index()
  @Column({ type: 'uuid', nullable: true })
  actorId?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  actorEmail?: string;

  // Action performed (e.g., LEASE_ACTIVATED, PAYMENT_VERIFIED, PROPERTY_CREATED)
  @Index()
  @Column({ type: 'varchar', length: 100 })
  action: string;

  // Affected domain entity (e.g., Property, Lease, Invoice, Payment)
  @Index()
  @Column({ type: 'varchar', length: 100 })
  entity: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  entityId?: string;

  // Snapshots of the data before and after the change (Section 33)
  @Column({ type: 'jsonb', nullable: true })
  beforeState?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  afterState?: Record<string, any>;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ipAddress?: string;

  // Immutable: ONLY createdAt exists (no updatedAt, no deletedAt per BR-AUD-01)
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}