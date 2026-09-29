import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';
import { PostgresExceptionFilter } from './common/filters/postgres-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. Security & Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
      contentSecurityPolicy: false,
    }),
  );

  // 2. CORS configuration for ngrok, Vite local dev, and REST/WebSocket
  app.enableCors({
    origin: [
      'http://localhost:5173',
      /\.ngrok-free\.dev$/,
      /\.ngrok-free\.app$/,
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'ngrok-skip-browser-warning',
    ],
    credentials: true,
  });

  // 3. Serve Static Assets (public files like quiz.html and uploads)
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // 4. Global Filters & Validation Pipes
  app.useGlobalFilters(new PostgresExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 5. Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Robo Advisor API')
    .setDescription('Robo Advisor Backend API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 6. Bind to dynamic Railway PORT or fallback to 8080
  const port = process.env.PORT || 8080;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}`);
}

bootstrap();