// src/modules/payments/payments.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios'; // 1. Added HttpModule for external HTTP calls
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ChapaService } from './chapa.service'; // 2. Added ChapaService provider
import { Payment } from './entities/payment.entity';
import { Invoice } from '@modules/invoices/entities/invoice.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Invoice]),
    HttpModule, // 3. Gives ChapaService the ability to call Chapa API
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, ChapaService], // 4. Registered ChapaService
  exports: [PaymentsService, ChapaService],
})
export class PaymentsModule {}