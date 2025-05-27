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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: z.infer<typeof RegisterDto>) {
    const existingUser = await this.usersRepo.findOneBy({ email: data.email });
    if (existingUser) throw new BadRequestException('E-mail já cadastrado');

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.usersRepo.create({
      ...data,
      password: hashedPassword,
    });

    await this.usersRepo.save(user);
    return { message: 'Cadastro realizado com sucesso!' };
  }

  async login(data: z.infer<typeof LoginDto>) {
    const user = await this.usersRepo.findOneBy({ email: data.email });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const passwordValid = await bcrypt.compare(data.password, user.password);
    if (!passwordValid)
      throw new UnauthorizedException('Credenciais inválidas');

    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    return { access_token: token };
  }
}
