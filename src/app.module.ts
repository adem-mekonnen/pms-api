// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PropertiesModule } from './modules/properties/properties.module';
import { UnitsModule } from './modules/units/units.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { LeasesModule } from './modules/leases/leases.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditModule } from './modules/audit/audit.module';
import configuration from './config/configuration';

@Module({
  imports: [
    // 1. Loads .env file and our custom configuration object globally
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // 2. Connects to PostgreSQL using values from ConfigService
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.name'),
        autoLoadEntities: true, // Automatically registers entities we create later
        synchronize: true,      // Automatically synchronizes entities with tables in dev
        logging: ['error', 'warn'],
      }),
    }),

    PropertiesModule,

    UnitsModule,

    TenantsModule,

    LeasesModule,

    InvoicesModule,

    PaymentsModule,

    UsersModule,

    AuthModule,

    MaintenanceModule,

    ReportsModule,

    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}