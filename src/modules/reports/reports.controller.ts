// src/modules/reports/reports.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

// Clean Enterprise Path Aliases
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@common/guards/permissions.guard';
import { RequirePermissions } from '@common/decorators/permissions.decorator';
import { Permission } from '@common/enums/permissions.enum';
import { CurrentOrg } from '@common/decorators/current-org.decorator';

@ApiTags('Reports & Analytics')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @RequirePermissions(Permission.REPORT_VIEW)
  @ApiOperation({ summary: 'Get Owner Dashboard real-time metrics (FR-RPT-001, Section 28)' })
  @ApiResponse({ status: 200, description: 'Aggregated portfolio summary.' })
  getDashboard(@CurrentOrg() organizationId: string) {
    return this.reportsService.getDashboardSummary(organizationId);
  }
}