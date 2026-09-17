// src/modules/properties/properties.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';

@UseGuards(JwtAuthGuard) // 1. Enforces authentication on all property endpoints
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  create(
    @CurrentOrg() organizationId: string,
    @Body() createPropertyDto: CreatePropertyDto,
  ) {
    // 2. Automatically injects the verified organizationId from the JWT
    return this.propertiesService.create({
      ...createPropertyDto,
      organizationId,
    });
  }

  @Get()
  findAll(@CurrentOrg() organizationId: string) {
    // 3. No query parameter needed; user only sees their own organization's properties
    return this.propertiesService.findAll(organizationId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentOrg() organizationId: string,
  ) {
    return this.propertiesService.findOne(id, organizationId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentOrg() organizationId: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(id, organizationId, updatePropertyDto);
  }

  @Patch(':id/archive')
  archive(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentOrg() organizationId: string,
  ) {
    return this.propertiesService.archive(id, organizationId);
  }
}