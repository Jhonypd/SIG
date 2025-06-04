import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { EncryptionService } from 'src/common/encryption/encryption.service';
import { UsersModule } from '../usuarios/usuarios.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/usuarios.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy, EncryptionService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
