import { Controller, Get } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { AppService } from '@/app/app.service';
/**
 * Root controller — only the hello-world health check lives here.
 * @AllowAnonymous() is required because AuthModule registers a global
 * AuthGuard that protects every route by default.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @AllowAnonymous()
  getHello(): string {
    return this.appService.getHello();
  }
}
