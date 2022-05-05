import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { UserService } from '../services/users.service';
import { UserRole } from '../models/user-role.enum';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { ParamGuard } from '../guards/param.guard';
import { UpdateUsernameDto } from '../models/dto/update-username.dto';
import { UpdatePasswordDto } from '../models/dto/update-password.dto';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @ApiBearerAuth()
  findAll() {
    return this.userService.findAllUsers();
  }

  @Post('update/username/:id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, ParamGuard)
  @ApiBearerAuth()
  updateUsername(
    @Param('id') id: number,
    @Body() updateUsernameDto: UpdateUsernameDto,
  ) {
    return this.userService.updateUsername(id, updateUsernameDto);
  }

  @Post('update/password/:id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, ParamGuard)
  @ApiBearerAuth()
  updatePassword(
    @Param('id') id: number,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.userService.updatePassword(id, updatePasswordDto);
  }
}
