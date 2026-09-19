// src/modules/invoices/invoices.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

// Clean Enterprise Path Aliases
import { InvoicesService } from '@modules/invoices/invoices.service';
import { GenerateInvoiceDto } from '@modules/invoices/dto/generate-invoice.dto'; // 1. Uses the DTO
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentOrg } from '@common/decorators/current-org.decorator';

@ApiTags('Invoices')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard) // 2. Protects with JWT
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a monthly invoice for an active lease (BR-INV-01, BR-FIN-01)' })
  @ApiResponse({ status: 201, description: 'Invoice successfully generated.' })
  @ApiResponse({ status: 409, description: 'Invoice already exists for this period.' })
  generate(
    @CurrentOrg() organizationId: string, // 3. Verified organizationId from token
    @Body() dto: GenerateInvoiceDto,
  ) {
    return this.invoicesService.generateMonthlyInvoice(
      dto.leaseId,
      dto.organizationId || organizationId,
      dto.year,
      dto.month,
    );
  }

  @Get('by-lease/:leaseId')
  @ApiOperation({ summary: 'Get all invoices for a specific lease' })
  findByLease(
    @Param('leaseId', ParseUUIDPipe) leaseId: string,
    @CurrentOrg() organizationId: string, // 4. Scoped to current user's organization
  ) {
    return this.invoicesService.findByLease(leaseId, organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an invoice by ID with line items and tenant details' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentOrg() organizationId: string,
  ) {
    return this.invoicesService.findOne(id, organizationId);
  }
}