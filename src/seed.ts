import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const userRepo = dataSource.getRepository('User');
  const profileRepo = dataSource.getRepository('RiskProfile');

  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const mockUsers = [
    {
      name: 'Pompompurin',
      email: 'purin@sanrio.dev',
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=purin',
      tier: 'MODERATE',
      score: 65,
      answers: { time_horizon: 'medium_long', volatility_reaction: 'hold', goal: 'balanced', experience: 'intermediate' },
    },
    {
      name: 'Kuromi Dark',
      email: 'kuromi@sanrio.dev',
      role: 'user',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=kuromi',
      tier: 'AGGRESSIVE',
      score: 90,
      answers: { time_horizon: 'long', volatility_reaction: 'buy_dip', goal: 'growth', experience: 'expert' },
    },
    {
      name: 'My Melody',
      email: 'melody@sanrio.dev',
      role: 'user',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=melody',
      tier: 'GROWTH',
      score: 78,
      answers: { time_horizon: 'long', volatility_reaction: 'hold', goal: 'growth', experience: 'intermediate' },
    },
    {
      name: 'Cinnamoroll',
      email: 'cinna@sanrio.dev',
      role: 'user',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=cinna',
      tier: 'CONSERVATIVE',
      score: 35,
      answers: { time_horizon: 'short', volatility_reaction: 'panic_sell', goal: 'preserve', experience: 'beginner' },
    },
    {
      name: 'Keroppi Pond',
      email: 'keroppi@sanrio.dev',
      role: 'user',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=keroppi',
      tier: 'MODERATE',
      score: 60,
      answers: { time_horizon: 'medium_short', volatility_reaction: 'hold', goal: 'balanced', experience: 'beginner' },
    },
    {
      name: 'Hello Kitty',
      email: 'kitty@sanrio.dev',
      role: 'user',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=kitty',
      tier: 'GROWTH',
      score: 82,
      answers: { time_horizon: 'long', volatility_reaction: 'buy_dip', goal: 'balanced', experience: 'expert' },
    },
  ];

  for (const u of mockUsers) {
    const existing = await userRepo.findOne({ where: { email: u.email } });
    if (existing) continue;

    const user = userRepo.create({
      name: u.name,
      email: u.email,
      password: passwordHash,
      role: u.role,
      avatar: u.avatar,
    });
    const savedUser = await userRepo.save(user);

    const profile = profileRepo.create({
      user: savedUser,
      score: u.score,
      tier: u.tier,
      answers: u.answers,
    });
    await profileRepo.save(profile);
  }

  console.log('✅ Seeding completed! (Default password: Password123!)');
  await app.close();
}

bootstrap();