import { Module } from '@nestjs/common';
import { UsuarioService } from './usuarios.service';
import { EncryptionService } from 'src/common/encryption/encryption.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './usuarios.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  providers: [UsuarioService, EncryptionService],
  exports: [UsuarioService],
})
export class UsersModule {}
