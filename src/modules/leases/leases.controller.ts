// src/modules/leases/leases.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { LeasesService } from './leases.service';
import { CreateLeaseDto } from './dto/create-lease.dto';

@Controller('leases')
export class LeasesController {
  constructor(private readonly leasesService: LeasesService) {}

  @Post()
  create(@Body() createLeaseDto: CreateLeaseDto) {
    return this.leasesService.create(createLeaseDto);
  }

  @Patch(':id/activate')
  activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    return this.leasesService.activate(id, organizationId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    return this.leasesService.findOne(id, organizationId);
  }
}