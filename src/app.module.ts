import { AuthModule } from './modules/auth/auth.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { ImageModule } from './modules/image/images.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DATABASE_HOST'),
        port: +config.get('DATABASE_PORT'),
        username: config.get('DATABASE_USER'),
        password: config.get('DATABASE_PASS'),
        database: config.get('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    AuthModule,
    VehiclesModule,
    ImageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
