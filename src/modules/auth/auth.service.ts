import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/users/users.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { z } from 'zod';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { createHmac } from 'crypto';
import { StandardResponse } from 'src/common/interfaces/response.interface';
import { EncryptionService } from 'src/common/encryption/encryption.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async register(
    data: z.infer<typeof RegisterDto>,
  ): Promise<StandardResponse<{ Id: string }>> {
    const validation = RegisterDto.safeParse(data);

    if (!validation.success) {
      throw new BadRequestException(validation.error);
    }

    const existingUser = await this.usersRepo.findOneBy({
      emailHash: this.hashEmail(data.email),
    });

    if (existingUser) throw new BadRequestException('E-mail já cadastrado');

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const hashedEmail = this.hashEmail(data.email);

    const user = this.usersRepo.create({
      ...data,
      name: this.encryptionService.encrypt(data.name),
      email: this.encryptionService.encrypt(data.email),
      emailHash: hashedEmail,
      password: hashedPassword,
    });

    await this.usersRepo.save(user);

    return {
      Result: { Id: user.id },
      Success: true,
      Message: 'Usuário cadastrado com sucesso',
      Detail: null,
      ReturnCode: 200,
      ReturnType: 1,
      ResponseTime: 0,
    };
  }

  async login(
    data: z.infer<typeof LoginDto>,
  ): Promise<StandardResponse<{ Token: string }>> {
    const validation = LoginDto.safeParse(data);
    if (!validation.success) {
      throw new BadRequestException(validation.error);
    }

    const user = await this.usersRepo.findOneBy({
      emailHash: this.hashEmail(data.email),
    });

    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const passwordValid = await bcrypt.compare(data.password, user.password);

    if (!passwordValid)
      throw new UnauthorizedException('Credenciais inválidas');

    const payload = {
      sub: user.id,
      email: this.encryptionService.decrypt(user.email),
      name: this.encryptionService.decrypt(user.name),
    };
    const token = await this.jwtService.signAsync(payload);

    return {
      Result: { Token: token },
      Success: true,
      Message: 'Login realizado com sucesso',
      Detail: null,
      ReturnCode: 200,
      ReturnType: 1,
      ResponseTime: 0,
    };
  }

  private hashEmail(email: string) {
    const secret = process.env.HASH_SECRET;

    if (!email) {
      throw new BadRequestException('Valor invalido para gerar o hash');
    }
    if (!secret) {
      throw new BadRequestException('HASH_SECRET não configurado');
    }
    return createHmac('sha256', secret).update(email).digest('hex');
  }
}
