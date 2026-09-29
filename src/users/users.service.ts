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

  async findAll(paginationQuery?: any) {
    const limit = paginationQuery?.limit || 10;
    const page = paginationQuery?.page || 1;
    const skip = paginationQuery?.offset ?? (page - 1) * limit;

    const [items, total] = await this.userRepository.findAndCount({
      relations: { riskProfile: true },
      take: limit,
      skip: skip,
    });

    return { items, total, limit, page };
  }

  async getProfile(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { riskProfile: true },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
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
      user.role = dto.role;
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

    return this.getProfile(savedUser.id);
  }

  async remove(id: number) {
    const user = await this.getProfile(id);
    await this.userRepository.remove(user);
  }

  // src/users/users.service.ts
async logTreat(userId: number, treatName: string, pointsEarned: number = 25) {
  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) throw new NotFoundException('Executive not found');

  user.treat_points = (user.treat_points || 0) + pointsEarned;
  await this.userRepository.save(user);

  return {
    message: `Logged ${treatName}! Gained ${pointsEarned} Treat Points ✨`,
    currentPoints: user.treat_points,
  };
}

// backend/src/users/users.service.ts
async updatePoints(userId: number, points: number) {
  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) throw new NotFoundException('Target user not found');
  
  user.treat_points = points;
  return this.userRepository.save(user);
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

  async updateAvatar(userId: number, avatarUrl: string) {
    const user = await this.getProfile(userId);
    user.avatar = avatarUrl;
    await this.userRepository.save(user);
    return user;
  }

}

