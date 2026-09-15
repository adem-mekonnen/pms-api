// src/modules/properties/entities/property.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
  Index,
  OneToMany, // 1. Added OneToMany
} from 'typeorm';
import { Unit } from '../../units/entities/unit.entity'; // 2. Imported Unit

export enum PropertyType {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
  MIXED_USE = 'MIXED_USE',
}

export enum PropertyStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Multi-tenancy isolation key (BR-ORG-01, Section 44.5)
  @Index()
  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({
    type: 'enum',
    enum: PropertyType,
    default: PropertyType.RESIDENTIAL,
  })
  type: PropertyType;

  // Ethiopian Address Structure (FR-PROP-001)
  @Column({ type: 'varchar', length: 100 })
  region: string;

  @Column({ type: 'varchar', length: 100, default: 'Addis Ababa' })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  subCity: string;

  @Column({ type: 'varchar', length: 100 })
  woredaKebele: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  landmark?: string;

  @Column({ type: 'int', default: 1 })
  totalFloors: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: PropertyStatus,
    default: PropertyStatus.ACTIVE,
  })
  status: PropertyStatus;

  // Optimistic Concurrency Control (Section 44.5)
  @VersionColumn()
  version: number;

  // 3. 1:N Relationship: One Property has Many Units
  @OneToMany(() => Unit, (unit) => unit.property)
  units: Unit[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  // Lifecycle Rule: Archived/Soft-deleted rather than hard-deleted (BR-PROP-02, Section 31.1)
  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedAt?: Date;
}