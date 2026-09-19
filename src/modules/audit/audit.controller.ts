// src/modules/audit/audit.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuditService } from './audit.service';

// Clean Enterprise Path Aliases
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@common/guards/permissions.guard';
import { RequirePermissions } from '@common/decorators/permissions.decorator';
import { Permission } from '@common/enums/permissions.enum';
import { CurrentOrg } from '@common/decorators/current-org.decorator';
import { PaginationDto } from '@common/dto/pagination.dto';

@ApiTags('Audit Logs')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermissions(Permission.AUDIT_VIEW)
  @ApiOperation({ summary: 'View immutable audit log entries (FR-AUD-002, Section 33)' })
  @ApiResponse({ status: 200, description: 'Paginated audit trail records.' })
  findAll(
    @CurrentOrg() organizationId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.auditService.findAll(organizationId, paginationDto);
  }
}