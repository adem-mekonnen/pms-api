// src/modules/users/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INVITED = 'INVITED',
  DEACTIVATED = 'DEACTIVATED',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Multi-tenancy key (BR-ORG-01)
  @Index()
  @Column({ type: 'uuid' })
  organizationId: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 150 })
  email: string;

  // Stored as a secure bcrypt hash - NEVER plain text (Section 31)
  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedAt?: Date;
}