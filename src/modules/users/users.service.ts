// src/modules/users/users.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userData: {
    organizationId: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { email: userData.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('A user with this email already exists.');
    }

    // Cryptography: Hash password with salt rounds = 10 (Section 31)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);

    const user = this.userRepository.create({
      organizationId: userData.organizationId,
      email: userData.email.toLowerCase(),
      passwordHash,
      firstName: userData.firstName,
      lastName: userData.lastName,
    });

    return await this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }
}