// src/modules/leases/leases.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeasesController } from './leases.controller';
import { LeasesService } from './leases.service';
import { Lease } from './entities/lease.entity';
import { Unit } from '../units/entities/unit.entity';
import { Tenant } from '../tenants/entities/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lease, Unit, Tenant])],
  controllers: [LeasesController],
  providers: [LeasesService],
  exports: [LeasesService],
})
export class LeasesModule {}