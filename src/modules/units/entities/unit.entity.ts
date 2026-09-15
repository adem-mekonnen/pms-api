// src/modules/units/entities/unit.entity.ts
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
  Unique,
} from 'typeorm';
import { Property } from '../../properties/entities/property.entity';

export enum UnitStatus {
  VACANT = 'VACANT',
  OCCUPIED = 'OCCUPIED',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
  RESERVED = 'RESERVED',
}

export enum UnitType {
  APARTMENT = 'APARTMENT',
  OFFICE = 'OFFICE',
  RETAIL = 'RETAIL',
  WAREHOUSE = 'WAREHOUSE',
}

@Entity('units')
// BR-PROP-01: Unit Code is unique within its parent property
@Unique('UQ_property_unit_code', ['propertyId', 'code'])
export class Unit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Multi-tenancy isolation key (BR-ORG-01)
  @Index()
  @Column({ type: 'uuid' })
  organizationId: string;

  // Foreign Key column
  @Column({ type: 'uuid' })
  propertyId: string;

  // Relationship: Many Units belong to One Property
  @ManyToOne(() => Property, (property) => property.units, {
    onDelete: 'RESTRICT', // Prevents deleting property if units exist
  })
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({
    type: 'enum',
    enum: UnitType,
    default: UnitType.APARTMENT,
  })
  type: UnitType;

  @Column({
    type: 'enum',
    enum: UnitStatus,
    default: UnitStatus.VACANT,
  })
  status: UnitStatus;

  // Section 44.5: Decimal precision for monetary amounts in ETB
  @Column({ type: 'numeric', precision: 18, scale: 2 })
  marketRent: number;

  @Column({ type: 'int', default: 1 })
  floorNumber: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  sizeSqm?: number;

  @Column({ type: 'int', default: 1 })
  totalRooms: number;

  @Column({ type: 'int', default: 1 })
  bedrooms: number;

  @Column({ type: 'int', default: 1 })
  bathrooms: number;

  @Column({ type: 'boolean', default: false })
  isFurnished: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedAt?: Date;
}