import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Redirect,
} from '@nestjs/common';

import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../models/dto/register.dto';
import { LoginDto } from '../models/dto/login.dto';
import { EmailConfirmationDto } from '../models/dto/email-confirmation.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('confirmation/resend')
  @HttpCode(200)
  resendConfirmation(@Body() emailConfirmationDto: EmailConfirmationDto) {
    return this.authService.resendConfirmation(emailConfirmationDto);
  }

  @Get('confirmation/:jwt')
  @HttpCode(200)
  @Redirect(process.env.CLIENT_URL)
  confirm(@Param('jwt') jwt: string) {
    return this.authService.confirmEmail(jwt);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
