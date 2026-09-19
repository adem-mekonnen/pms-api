// src/modules/maintenance/maintenance.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';

// Clean Enterprise Path Aliases
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@common/guards/permissions.guard';
import { RequirePermissions } from '@common/decorators/permissions.decorator';
import { Permission } from '@common/enums/permissions.enum';
import { CurrentOrg } from '@common/decorators/current-org.decorator';
import { PaginationDto } from '@common/dto/pagination.dto';

@ApiTags('Maintenance')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @RequirePermissions(Permission.MAINTENANCE_CREATE)
  @ApiOperation({ summary: 'Submit a new maintenance ticket (FR-MNT-001)' })
  @ApiResponse({ status: 201, description: 'Ticket created in OPEN status.' })
  create(
    @CurrentOrg() organizationId: string,
    @Body() createTicketDto: CreateTicketDto,
  ) {
    return this.maintenanceService.create(createTicketDto, organizationId);
  }

  @Get()
  @RequirePermissions(Permission.MAINTENANCE_VIEW)
  @ApiOperation({ summary: 'List all maintenance tickets (paginated)' })
  @ApiResponse({ status: 200, description: 'Paginated tickets list.' })
  findAll(
    @CurrentOrg() organizationId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.maintenanceService.findAll(organizationId, paginationDto);
  }

  @Get(':id')
  @RequirePermissions(Permission.MAINTENANCE_VIEW)
  @ApiOperation({ summary: 'Get details of a specific maintenance ticket' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentOrg() organizationId: string,
  ) {
    return this.maintenanceService.findOne(id, organizationId);
  }

  @Patch(':id/status')
  @RequirePermissions(Permission.MAINTENANCE_UPDATE)
  @ApiOperation({ summary: 'Update ticket status and notes (FR-MNT-002)' })
  @ApiResponse({ status: 200, description: 'Ticket status updated.' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentOrg() organizationId: string,
    @Body() updateDto: UpdateTicketStatusDto,
  ) {
    return this.maintenanceService.updateStatus(id, organizationId, updateDto);
  }
}