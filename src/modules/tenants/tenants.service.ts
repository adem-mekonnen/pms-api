// src/modules/tenants/tenants.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const tenant = this.tenantRepository.create(createTenantDto);
    return await this.tenantRepository.save(tenant);
  }

  async findAll(organizationId: string): Promise<Tenant[]> {
    return await this.tenantRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, organizationId: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id, organizationId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID "${id}" was not found.`);
    }

    return tenant;
  }
}