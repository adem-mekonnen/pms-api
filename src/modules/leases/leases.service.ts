// src/modules/leases/leases.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

// Clean Enterprise Path Aliases (@modules/*)
import { Lease, LeaseStatus } from '@modules/leases/entities/lease.entity';
import { Unit, UnitStatus } from '@modules/units/entities/unit.entity';
import { Tenant } from '@modules/tenants/entities/tenant.entity';
import { CreateLeaseDto } from '@modules/leases/dto/create-lease.dto';
import { AuditService } from '@modules/audit/audit.service'; // 1. Imported AuditService

@Injectable()
export class LeasesService {
  constructor(
    @InjectRepository(Lease)
    private readonly leaseRepository: Repository<Lease>,
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly auditService: AuditService, // 2. Injected AuditService
  ) {}

  async create(createLeaseDto: CreateLeaseDto): Promise<Lease> {
    const { organizationId, tenantId, propertyId, unitIds, startDate, durationMonths } = createLeaseDto;

    // 1. Verify tenant exists
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId, organizationId },
    });
    if (!tenant) throw new NotFoundException('Tenant not found in this organization.');

    // 2. Verify all units exist
    const units = await this.unitRepository.find({
      where: { id: In(unitIds), propertyId, organizationId },
    });
    if (units.length !== unitIds.length) {
      throw new BadRequestException('One or more selected units do not exist in this property.');
    }

    // 3. Compute endDate from startDate + durationMonths
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + durationMonths);
    const endDate = end.toISOString().split('T')[0];

    // 4. Create lease in DRAFT status
    const lease = this.leaseRepository.create({
      ...createLeaseDto,
      endDate,
      units,
      status: LeaseStatus.DRAFT,
    });

    return await this.leaseRepository.save(lease);
  }

  async activate(id: string, organizationId: string): Promise<Lease> {
    const lease = await this.leaseRepository.findOne({
      where: { id, organizationId },
      relations: { units: true, tenant: true },
    });

    if (!lease) throw new NotFoundException(`Lease with ID "${id}" was not found.`);

    if (lease.status === LeaseStatus.ACTIVE) {
      throw new BadRequestException('Lease is already active.');
    }

    // BR-LEASE-01 / AC-06: Check if any attached unit is already covered by an ACTIVE lease
    for (const unit of lease.units) {
      const activeLease = await this.leaseRepository
        .createQueryBuilder('lease')
        .innerJoin('lease.units', 'unit', 'unit.id = :unitId', { unitId: unit.id })
        .where('lease.organizationId = :organizationId', { organizationId })
        .andWhere('lease.status = :status', { status: LeaseStatus.ACTIVE })
        .getOne();

      if (activeLease) {
        throw new ConflictException(
          `Unit "${unit.code}" is already covered by an Active lease (${activeLease.id}).`,
        );
      }
    }

    // BR-UNIT-01: Set units status to OCCUPIED
    for (const unit of lease.units) {
      unit.status = UnitStatus.OCCUPIED;
      await this.unitRepository.save(unit);
    }

    // Set lease to ACTIVE
    lease.status = LeaseStatus.ACTIVE;
    const savedLease = await this.leaseRepository.save(lease);

    // 3. Record Immutable Audit Log (FR-AUD-001, Section 33)
    await this.auditService.logAction({
      organizationId,
      action: 'LEASE_ACTIVATED',
      entity: 'Lease',
      entityId: savedLease.id,
      afterState: {
        status: savedLease.status,
        monthlyRent: savedLease.monthlyRent,
        unitsCovered: savedLease.units.map((u) => u.code),
      },
    });

    return savedLease;
  }

  async findOne(id: string, organizationId: string): Promise<Lease> {
    const lease = await this.leaseRepository.findOne({
      where: { id, organizationId },
      relations: { units: true, tenant: true, property: true },
    });
    if (!lease) throw new NotFoundException(`Lease with ID "${id}" was not found.`);
    return lease;
  }
}