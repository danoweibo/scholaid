import { Controller, Get } from '@nestjs/common';
import {
  Session,
  AllowAnonymous,
  OptionalAuth,
} from '@thallesp/nestjs-better-auth';
import { sql } from 'drizzle-orm';
import { DBService } from '@/db/db.service';
import type { UserSession } from '@thallesp/nestjs-better-auth';

@Controller('users')
export class UserController {
  constructor(private readonly db: DBService) {}

  @Get('me')
  async getProfile(@Session() session: UserSession) {
    return { user: session.user };
  }

  @Get('public')
  @AllowAnonymous()
  async getPublic() {
    return { message: 'Public route' };
  }

  @Get('db-test')
  @AllowAnonymous()
  async testDb() {
    try {
      return await this.db.db.execute(sql`SELECT 1`);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  @Get('optional')
  @OptionalAuth()
  async getOptional(@Session() session: UserSession) {
    return { authenticated: !!session };
  }
}
