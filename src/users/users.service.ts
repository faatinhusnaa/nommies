// src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from './entities/user.entity';
import { RiskProfile, RiskTier } from '../risk-profile/entities/risk-profile.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QUIZ_SCORE_MAP } from '../auth/constants/risk-quiz.constant';
import { UserAnswersDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RiskProfile)
    private readonly riskProfileRepository: Repository<RiskProfile>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: UserRole.USER,
    });
    return await this.userRepository.save(user);
  }

  // src/users/users.service.ts
async findAll(paginationQuery?: any) {
  const limit = paginationQuery?.limit || 50;
  const page = paginationQuery?.page || 1;
  const skip = paginationQuery?.offset ?? (page - 1) * limit;

  // Use QueryBuilder to force-select the points column and avoid any TypeORM hydration drops
  const query = this.userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.riskProfile', 'riskProfile')
    .addSelect('user.treat_points') // explicitly forces loading the points column
    .orderBy('user.id', 'ASC')
    .take(limit)
    .skip(skip);

  const [rawUsers, total] = await query.getManyAndCount();

  const mappedItems = rawUsers.map((u: any) => {
    // Check every possible variation
    const pts = Number(u.treat_points ?? u.treatPoints ?? u.points ?? 0);
    return {
      ...u,
      treat_points: pts,
      treatPoints: pts,
      points: pts,
    };
  });

  return {
    items: mappedItems,
    data: mappedItems,
    total,
    limit,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { riskProfile: true },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async getProfile(id: number): Promise<User> {
    return this.findOne(id);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.name) {
      user.name = updateUserDto.name;
    }

    if (updateUserDto.role) {
      user.role = updateUserDto.role as UserRole;
    }

    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return await this.userRepository.save(user);
  }

  async updateProfile(
    targetUserId: number,
    currentUser: { id: number; role: any },
    dto: UpdateUserDto,
  ) {
    if (
      currentUser.role !== 'admin' &&
      currentUser.role !== UserRole.ADMIN &&
      currentUser.id !== targetUserId
    ) {
      throw new ForbiddenException('You can only update your own profile');
    }

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .leftJoinAndSelect('user.riskProfile', 'riskProfile')
      .where('user.id = :id', { id: targetUserId })
      .getOne();

    if (!user) {
      throw new NotFoundException(`User with ID ${targetUserId} not found`);
    }

    if (dto.name) {
      user.name = dto.name;
    }

    if (dto.password) {
      const isSelf = currentUser.id === targetUserId;
      if (isSelf) {
        if (!dto.currentPassword) {
          throw new BadRequestException(
            'Current password is required to set a new password',
          );
        }
        const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
        if (!isMatch) {
          throw new UnauthorizedException('Current password is incorrect');
        }
      }
      user.password = await bcrypt.hash(dto.password, 10);
    }

    if (dto.role) {
      if (
        currentUser.role !== 'admin' &&
        currentUser.role !== UserRole.ADMIN
      ) {
        throw new ForbiddenException('Only administrators can change roles');
      }
      user.role = dto.role as UserRole;
    }

    const savedUser = await this.userRepository.save(user);

    if (dto.quiz) {
      const { score, tier } = this.calculateRisk(dto.quiz);
      let profile = user.riskProfile;

      if (profile) {
        profile.score = score;
        profile.tier = tier;
        profile.answers = dto.quiz;
      } else {
        profile = this.riskProfileRepository.create({
          score,
          tier,
          answers: dto.quiz,
          user: savedUser,
        });
      }
      await this.riskProfileRepository.save(profile);
    }

    return this.findOne(savedUser.id);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async logTreat(userId: number, treatName: string, pointsEarned: number) {
  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException(`User #${userId} not found`);
  }

  // Add points to current total
  user.treat_points = (Number(user.treat_points) || 0) + Number(pointsEarned);
  
  await this.userRepository.save(user);

  return {
    success: true,
    treatName,
    pointsAdded: pointsEarned,
    currentPoints: user.treat_points,
  };
}

  async resetPoints(userId: number, points: number = 0): Promise<User> {
    const user = await this.findOne(userId);
    user.treat_points = points;
    return await this.userRepository.save(user);
  }

  async updatePoints(userId: number, points: number): Promise<User> {
    return this.resetPoints(userId, points);
  }

  private calculateRisk(answers: UserAnswersDto): { score: number; tier: RiskTier } {
    const horizonScore = QUIZ_SCORE_MAP.time_horizon[answers.time_horizon] ?? 0;
    const volatilityScore = QUIZ_SCORE_MAP.volatility_reaction[answers.volatility_reaction] ?? 0;
    const goalScore = QUIZ_SCORE_MAP.goal[answers.goal] ?? 0;
    const expScore = QUIZ_SCORE_MAP.experience[answers.experience] ?? 5;

    const total = horizonScore + volatilityScore + goalScore + expScore;

    let tier = RiskTier.CONSERVATIVE;
    if (total > 80) tier = RiskTier.AGGRESSIVE;
    else if (total > 65) tier = RiskTier.GROWTH;
    else if (total > 30) tier = RiskTier.MODERATE;

    return { score: total, tier };
  }

  async updateAvatar(userId: number, avatarUrl: string): Promise<User> {
    const user = await this.findOne(userId);
    user.avatar = avatarUrl;
    return await this.userRepository.save(user);
  }
}