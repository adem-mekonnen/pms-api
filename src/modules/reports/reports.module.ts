// src/modules/reports/reports.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

// Clean Enterprise Path Aliases
import { Property } from '@modules/properties/entities/property.entity';
import { Unit } from '@modules/units/entities/unit.entity';
import { Lease } from '@modules/leases/entities/lease.entity';
import { Invoice } from '@modules/invoices/entities/invoice.entity';
import { Payment } from '@modules/payments/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Property, Unit, Lease, Invoice, Payment]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}