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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'; // 1. Added Swagger imports
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

// 2. Groups this controller in Swagger UI and attaches the JWT padlock icon
@ApiTags('Properties')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new property in the current organization' })
  @ApiResponse({ status: 201, description: 'Property successfully created.' })
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
  @ApiOperation({ summary: 'List all properties with pagination' })
  @ApiResponse({ status: 200, description: 'List of paginated properties.' })
  @RequirePermissions(Permission.PROPERTY_VIEW)
  findAll(
    @CurrentOrg() organizationId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.propertiesService.findAll(organizationId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific property by ID' })
  @ApiResponse({ status: 200, description: 'Property found.' })
  @ApiResponse({ status: 404, description: 'Property not found.' })
  @RequirePermissions(Permission.PROPERTY_VIEW)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentOrg() organizationId: string,
  ) {
    return this.propertiesService.findOne(id, organizationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update property details' })
  @ApiResponse({ status: 200, description: 'Property successfully updated.' })
  @RequirePermissions(Permission.PROPERTY_UPDATE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentOrg() organizationId: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(id, organizationId, updatePropertyDto);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive a property (Soft Delete per BR-PROP-02)' })
  @ApiResponse({ status: 200, description: 'Property archived.' })
  @RequirePermissions(Permission.PROPERTY_UPDATE)
  archive(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentOrg() organizationId: string,
  ) {
    return this.propertiesService.archive(id, organizationId);
  }
}