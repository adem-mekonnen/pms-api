// src/modules/maintenance/maintenance.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceTicket } from './entities/maintenance-ticket.entity';

// Clean Enterprise Aliases
import { Unit } from '@modules/units/entities/unit.entity';
import { Tenant } from '@modules/tenants/entities/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MaintenanceTicket, Unit, Tenant])],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}