// src/modules/maintenance/maintenance.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceTicket, TicketStatus } from './entities/maintenance-ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';

// Clean Enterprise Aliases
import { PaginationDto } from '@common/dto/pagination.dto';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(MaintenanceTicket)
    private readonly ticketRepository: Repository<MaintenanceTicket>,
  ) {}

  // 1. Tenant or Staff creates a new ticket (FR-MNT-001)
  async create(createTicketDto: CreateTicketDto, organizationId: string): Promise<MaintenanceTicket> {
    const ticket = this.ticketRepository.create({
      ...createTicketDto,
      organizationId,
      status: TicketStatus.OPEN,
    });
    return await this.ticketRepository.save(ticket);
  }

  // 2. Staff views all tickets with pagination (FR-MNT-002)
  async findAll(organizationId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [items, totalItems] = await this.ticketRepository.findAndCount({
      where: { organizationId },
      relations: { tenant: true, unit: true },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  // 3. View single ticket details
  async findOne(id: string, organizationId: string): Promise<MaintenanceTicket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id, organizationId },
      relations: { tenant: true, unit: true },
    });

    if (!ticket) {
      throw new NotFoundException(`Maintenance ticket "${id}" not found.`);
    }

    return ticket;
  }

  // 4. Update status & assign contractor (FR-MNT-002)
  async updateStatus(
    id: string,
    organizationId: string,
    dto: UpdateTicketStatusDto,
  ): Promise<MaintenanceTicket> {
    const ticket = await this.findOne(id, organizationId);

    ticket.status = dto.status;
    if (dto.assignedTo) ticket.assignedTo = dto.assignedTo;
    if (dto.resolutionNotes) ticket.resolutionNotes = dto.resolutionNotes;

    return await this.ticketRepository.save(ticket);
  }
}