import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  api(): string {
    return `NestJS API v(${process.env.npm_package_version})`;
  }
}
