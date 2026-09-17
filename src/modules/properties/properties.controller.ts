// src/modules/properties/properties.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

// Clean Enterprise Path Aliases (@common/*)
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentOrg } from '@common/decorators/current-org.decorator';
import { PaginationDto } from '@common/dto/pagination.dto';
import { PermissionsGuard } from '@common/guards/permissions.guard';
import { RequirePermissions } from '@common/decorators/permissions.decorator';
import { Permission } from '@common/enums/permissions.enum';

// Authentication & Dynamic RBAC active
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @RequirePermissions(Permission.PROPERTY_CREATE)
  create(
    @CurrentOrg() organizationId: string,
    @Body() createPropertyDto: CreatePropertyDto,
  ) {
    return this.propertiesService.create({
      ...createPropertyDto,
      organizationId,
    });
  }

  @Get()
  @RequirePermissions(Permission.PROPERTY_VIEW)
  findAll(
    @CurrentOrg() organizationId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.propertiesService.findAll(organizationId, paginationDto);
  }

  @Get(':id')
  @RequirePermissions(Permission.PROPERTY_VIEW)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentOrg() organizationId: string,
  ) {
    return this.propertiesService.findOne(id, organizationId);
  }

  @Patch(':id')
  @RequirePermissions(Permission.PROPERTY_UPDATE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentOrg() organizationId: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(id, organizationId, updatePropertyDto);
  }

  @Patch(':id/archive')
  @RequirePermissions(Permission.PROPERTY_UPDATE)
  archive(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentOrg() organizationId: string,
  ) {
    return this.propertiesService.archive(id, organizationId);
  }
}