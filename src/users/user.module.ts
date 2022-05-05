import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserController } from './controllers/user.controller';
import { AuthController } from './controllers/auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './guards/jwt.strategy';
import { ParamGuard } from './guards/param.guard';
import { RolesGuard } from './guards/roles.guard';
import { UserEntity } from './models/user.entity';
import { AuthService } from './services/auth.service';
import { UserService } from './services/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
      }),
    }),
  ],
  providers: [
    UserService,
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    ParamGuard,
    RolesGuard,
  ],
  controllers: [UserController, AuthController],
})
export class UserModule {}
