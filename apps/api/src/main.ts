import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global para la API REST v2
  app.setGlobalPrefix('api/v1');

  // Habilitar CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Validación declarativa estricta
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuración de OpenAPI Swagger
  const config = new DocumentBuilder()
    .setTitle('Koda API 🦊')
    .setDescription('API REST v2.0 para la plataforma de aprendizaje gamificado Koda')
    .setVersion('2.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Koda Backend API running at http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger Documentation at http://localhost:${port}/api/docs`);
}

bootstrap();
