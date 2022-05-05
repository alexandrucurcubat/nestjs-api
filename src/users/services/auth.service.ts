import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { IUser } from '../models/user.interface';
import { UserEntity } from '../models/user.entity';
import { RegisterDto } from '../models/dto/register.dto';
import { LoginDto } from '../models/dto/login.dto';
import { IJwtResponse } from '../models/jwt-response.interface';
import { UserService } from './users.service';
import { EmailConfirmationDto } from '../models/dto/email-confirmation.dto';
import {
  EMAIL_EXISTS,
  INVALID_CREDENTIALS,
  USERNAME_EXISTS,
  USER_CONFIRMED,
  USER_UNCONFIRMED,
} from '../utils/exception-constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async register(registerDto: RegisterDto) {
    const email = registerDto.email;
    const username = registerDto.username;
    const password = registerDto.password;
    if (await this.userService.emailExists(email))
      throw new HttpException(EMAIL_EXISTS, HttpStatus.CONFLICT);
    if (await this.userService.usernameExists(username))
      throw new HttpException(USERNAME_EXISTS, HttpStatus.CONFLICT);
    registerDto.password = await bcrypt.hash(password, 12);
    const user = (await this.userRepository.save(registerDto)) as IUser;
    delete user.password;
    await this.sendEmailConfirmation(user);
    return user;
  }

  async confirmEmail(jwt: string) {
    try {
      const decodedJwt = this.jwtService.verify(jwt) as any;
      const user = decodedJwt.user;
      await this.userRepository.update(user.id, { confirmed: true });
      return { url: `${process.env.CLIENT_URL}/about` };
    } catch (error) {
      return { url: `${process.env.CLIENT_URL}/email-confirmation` };
    }
  }

  async resendConfirmation(emailConfirmationDto: EmailConfirmationDto) {
    const user = await this.userService.findUserByEmail(
      emailConfirmationDto.email,
    );
    if (!user)
      throw new HttpException(INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    if (user.confirmed)
      throw new HttpException(USER_CONFIRMED, HttpStatus.UNAUTHORIZED);
    await this.sendEmailConfirmation(user);
  }

  async login(loginDto: LoginDto) {
    const email = loginDto.email;
    const password = loginDto.password;
    const user = await this.userService.findUserByEmail(email);
    if (!user)
      throw new HttpException(INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    if (!(await bcrypt.compare(password, user.password)))
      throw new HttpException(INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    if (!user.confirmed)
      throw new HttpException(USER_UNCONFIRMED, HttpStatus.UNAUTHORIZED);
    delete user.password;
    return { jwt: await this.jwtService.signAsync({ user }) } as IJwtResponse;
  }

  private async sendEmailConfirmation(user: IUser) {
    const jwt = await this.jwtService.signAsync({ user });
    this.mailerService.sendMail({
      to: user.email,
      subject: 'NestJS - confirmare cont',
      html: `<a href="${process.env.API_URL}/auth/confirmation/${jwt}" target="_blank">Confirmă email</a>`,
    });
  }
}
