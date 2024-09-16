import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _script, scrypt } from 'crypto';
import { promisify } from 'util';
const script = promisify(_script);
@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}
  async singup(email: string, password: string) {
    let users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('Email already exist');
    }
    const salt = randomBytes(8).toString('hex');
    const hash = (await script(password, salt, 32)) as Buffer;

    const result = salt + '.' + hash.toString('hex');

    const user = this.usersService.create(email, result);
    return user;
  }

  async singin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const [salt, storedHash] = user.password.split('.');
    const hash = (await script(password, salt, 32)) as Buffer;
    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('Bad password');
    }
    return user;
  }
}
