import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { UpdatePasswordDto } from '../models/dto/update-password.dto';
import { UpdateUsernameDto } from '../models/dto/update-username.dto';
import { UserEntity } from '../models/user.entity';
import { IUser } from '../models/user.interface';
import {
  INVALID_CREDENTIALS,
  USERNAME_EXISTS,
} from '../utils/exception-constants';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  findUserById(id: number) {
    return this.userRepository.findOne(
      { id },
      { select: ['id', 'email', 'username', 'password', 'role'] },
    ) as Promise<IUser>;
  }

  findUserByEmail(email: string) {
    return this.userRepository.findOne(
      { email },
      { select: ['id', 'email', 'username', 'password', 'confirmed'] },
    ) as Promise<IUser>;
  }

  findAllUsers() {
    return this.userRepository.find() as Promise<IUser[]>;
  }

  async updateUsername(id: number, updateUsernameDto: UpdateUsernameDto) {
    const username = updateUsernameDto.username;
    const password = updateUsernameDto.password;
    const user = await this.findUserById(id);
    if (!(await bcrypt.compare(password, user.password)))
      throw new HttpException(INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    if (user.username === username) {
      delete user.password;
      return user;
    }
    if (await this.usernameExists(username))
      throw new HttpException(USERNAME_EXISTS, HttpStatus.CONFLICT);
    await this.userRepository.update(id, { username });
    const updatedUser = await this.findUserById(id);
    updatedUser.jwt = await this.jwtService.signAsync({ updatedUser });
    delete updatedUser.password;
    return updatedUser;
  }

  async updatePassword(id: number, updatePasswordDto: UpdatePasswordDto) {
    const newPassword = updatePasswordDto.newPassword;
    const oldPassword = updatePasswordDto.oldPassword;
    const user = await this.findUserById(id);
    if (!(await bcrypt.compare(oldPassword, user.password)))
      throw new HttpException(INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    this.userRepository.update(id, {
      password: await bcrypt.hash(newPassword, 12),
    });
    delete user.password;
    return user;
  }

  async usernameExists(username: string) {
    return (await this.userRepository.findOne({ username })) ? true : false;
  }

  async emailExists(email: string) {
    return (await this.userRepository.findOne({ email })) ? true : false;
  }
}
