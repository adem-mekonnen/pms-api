// src/modules/maintenance/entities/maintenance-ticket.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  VersionColumn,
} from 'typeorm';

// Clean Enterprise Path Aliases
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { Unit } from '@modules/units/entities/unit.entity';

export enum TicketCategory {
  PLUMBING = 'PLUMBING',
  ELECTRICAL = 'ELECTRICAL',
  STRUCTURAL = 'STRUCTURAL',
  APPLIANCE = 'APPLIANCE',
  OTHER = 'OTHER',
}

export enum TicketPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  CLOSED = 'CLOSED',
}

@Entity('maintenance_tickets')
export class MaintenanceTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Multi-tenancy key (BR-ORG-01)
  @Index()
  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ type: 'uuid' })
  unitId: string;

  @ManyToOne(() => Unit, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'unitId' })
  unit: Unit;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({
    type: 'enum',
    enum: TicketCategory,
    default: TicketCategory.OTHER,
  })
  category: TicketCategory;

  @Column({
    type: 'enum',
    enum: TicketPriority,
    default: TicketPriority.NORMAL,
  })
  priority: TicketPriority;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  status: TicketStatus;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  assignedTo?: string; // Assigned staff or contractor name

  @Column({ type: 'text', nullable: true })
  resolutionNotes?: string;

  @VersionColumn()
  version: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedAt?: Date;
}