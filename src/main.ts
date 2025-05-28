import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { swaggerConfig } from './config/swagger.config';
import { SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use((req, res, next) => {
    req.startTime = Date.now();
    next();
  });

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api/v1');

  const config = swaggerConfig;
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1', app, document);

  await app.listen(process.env.PORT ?? 4000, '0.0.0.0');

  console.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 4000}`,
  );
}

bootstrap();
