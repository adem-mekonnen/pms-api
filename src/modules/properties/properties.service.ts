// src/modules/properties/properties.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property, PropertyStatus } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

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

  async findAll(organizationId: string): Promise<Property[]> {
    // Multi-tenant isolation: Always filter by organizationId (BR-ORG-01)
    return await this.propertyRepository.find({
      where: { organizationId, status: PropertyStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
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