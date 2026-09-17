// src/modules/invoices/invoices.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { Invoice, InvoiceItem } from './entities/invoice.entity';
import { Lease } from '../leases/entities/lease.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, InvoiceItem, Lease])],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}