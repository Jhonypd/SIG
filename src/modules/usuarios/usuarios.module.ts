import { Module } from '@nestjs/common';
import { CriptografiaService } from 'src/common/encryption/criptografia.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './usuarios.entity';
import { BuscarUsuarioService } from './services/buscar-usuario.service';
import { CriarUsuarioService } from './services/criar-usuario.service';
import { UsuarioController } from './usuarios.controller';
import { AlterarUsuarioService } from './services/alterar-usuario.service';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  providers: [
    CriptografiaService,
    BuscarUsuarioService,
    CriarUsuarioService,
    AlterarUsuarioService,
  ],
  exports: [BuscarUsuarioService, CriarUsuarioService, AlterarUsuarioService],
  controllers: [UsuarioController],
})
export class UsersModule {}
