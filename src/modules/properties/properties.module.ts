// src/modules/properties/properties.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { Property } from './entities/property.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Property]), // Registers Property repository for DI
  ],
  controllers: [PropertiesController],
  providers: [PropertiesService],
  exports: [PropertiesService], // Ready for other modules (e.g., Leases) to use
})
export class PropertiesModule {}