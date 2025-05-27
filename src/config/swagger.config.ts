import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('API Gestão de Estoque de Veículos')
  .setDescription('Documentação da API')
  .setVersion('1.0.0')
  .addBearerAuth()
  .build();
