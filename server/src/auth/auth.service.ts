import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);
      const isPasswordValid = await bcrypt.compare(pass, user.password);
      
      if (isPasswordValid) {
        const { password, ...result } = user.toObject();
        return result;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id };
    return {
      user,
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const payload = { email: user.email, sub: user._id };
    
    return {
      user,
      access_token: this.jwtService.sign(payload),
    };
  }
}