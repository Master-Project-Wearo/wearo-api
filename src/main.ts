import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOrigins = process.env.CORS_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (corsOrigins?.length) {
    app.enableCors({ origin: corsOrigins });
  }

  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('API NestJS - Supabase')
    .setDescription('Documentation des routes de l API Wearo')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Access token Supabase',
        in: 'header',
      },
      'bearer',
    )
    .addSecurityRequirements('bearer')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error: unknown) => {
  console.error('Application startup failed', error);
  process.exit(1);
});
