import { AuthModule } from './modules/auth/auth.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VeiculosModule } from './modules/veiculos/veiculo.module';
import { ImagemModule } from './modules/imagens/imagens.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DATABASE_HOST'),
        port: parseInt(config.get<string>('DATABASE_PORT') ?? '3306', 10),
        username: config.get<string>('MYSQL_USER'),
        password: config.get<string>('MYSQL_PASSWORD'),
        database: config.get<string>('MYSQL_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    AuthModule,
    VeiculosModule,
    ImagemModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
