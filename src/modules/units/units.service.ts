// src/modules/units/units.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './entities/unit.entity';
import { CreateUnitDto } from './dto/create-unit.dto';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
  ) {}

  async create(createUnitDto: CreateUnitDto): Promise<Unit> {
    // BR-PROP-01: Check if unit code already exists within this property
    const existingUnit = await this.unitRepository.findOne({
      where: {
        propertyId: createUnitDto.propertyId,
        code: createUnitDto.code,
      },
    });

    if (existingUnit) {
      throw new ConflictException(
        `Unit code "${createUnitDto.code}" already exists in this property.`,
      );
    }

    const unit = this.unitRepository.create(createUnitDto);
    return await this.unitRepository.save(unit);
  }

  async findByProperty(
    propertyId: string,
    organizationId: string,
  ): Promise<Unit[]> {
    return await this.unitRepository.find({
      where: { propertyId, organizationId },
      order: { floorNumber: 'ASC', code: 'ASC' },
    });
  }

  async findOne(id: string, organizationId: string): Promise<Unit> {
    const unit = await this.unitRepository.findOne({
      where: { id, organizationId },
      relations: {
        property: true,
      },
    });
    if (!unit) {
      throw new NotFoundException(`Unit with ID "${id}" was not found.`);
    }

    return unit;
  }
}