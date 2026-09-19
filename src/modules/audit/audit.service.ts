// src/modules/audit/audit.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

// Clean Enterprise Path Aliases
import { PaginationDto } from '@common/dto/pagination.dto';

export interface LogActionParams {
  organizationId: string;
  actorId?: string;
  actorEmail?: string;
  action: string;
  entity: string;
  entityId?: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  // 1. Record an immutable audit log entry (FR-AUD-001, BR-AUD-01)
  async logAction(params: LogActionParams): Promise<AuditLog> {
    const entry = this.auditRepo.create(params);
    return await this.auditRepo.save(entry);
  }

  // 2. Query audit logs with pagination (FR-AUD-002)
  async findAll(organizationId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [items, totalItems] = await this.auditRepo.findAndCount({
      where: { organizationId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}