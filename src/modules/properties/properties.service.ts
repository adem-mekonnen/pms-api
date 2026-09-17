// src/modules/properties/properties.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property, PropertyStatus } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PaginationDto } from '../../common/dto/pagination.dto'; // 1. Added import

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
  ) {}

  async create(createPropertyDto: CreatePropertyDto): Promise<Property> {
    const property = this.propertyRepository.create(createPropertyDto);
    return await this.propertyRepository.save(property);
  }

  // 2. Updated findAll with server-side pagination (Section 44.12)
  async findAll(organizationId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    // findAndCount queries the database once and returns: [items, totalCount]
    const [items, totalItems] = await this.propertyRepository.findAndCount({
      where: { organizationId, status: PropertyStatus.ACTIVE },
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

  async findOne(id: string, organizationId: string): Promise<Property> {
    const property = await this.propertyRepository.findOne({
      where: { id, organizationId },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID "${id}" was not found.`);
    }

    return property;
  }

  async update(
    id: string,
    organizationId: string,
    updatePropertyDto: UpdatePropertyDto,
  ): Promise<Property> {
    const property = await this.findOne(id, organizationId);
    Object.assign(property, updatePropertyDto);
    return await this.propertyRepository.save(property);
  }

  async archive(id: string, organizationId: string): Promise<Property> {
    // BR-PROP-02: Archive instead of hard delete
    const property = await this.findOne(id, organizationId);
    property.status = PropertyStatus.ARCHIVED;
    return await this.propertyRepository.save(property);
  }
}