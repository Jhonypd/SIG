import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('API - SIG')
  .setDescription('Gestão de Estoque de Veículos')
  .setVersion('1.0.0')
  .addBearerAuth()
  .build();
