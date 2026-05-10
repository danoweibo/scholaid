import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { AppController } from '@/app/app.controller';
import { AppService } from '@/app/app.service';
import { DBModule } from '@/db/db.module';
import { AuthNestModule } from '@/auth/auth.nest.module';
import { MailModule } from '@/mail/mail.module';
import { UsersModule } from '@/users/users.module';
import { InvitesModule } from '@/invites/invites.module';
import { InstitutionsModule } from '@/institutions/institutions.module';
import { auth } from '@/auth/auth';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // ---------------------------------------------------------------------------
    // Rate limiting
    // Two tiers — a generous default for general API use and a strict tier
    // for auth endpoints to prevent brute-force attacks.
    //
    // default: 100 requests per 60 seconds per IP
    // auth:    10 requests per 60 seconds per IP
    //
    // Apply the strict tier on sensitive routes with:
    //   @Throttle({ auth: { limit: 10, ttl: 60000 } })
    // ---------------------------------------------------------------------------
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 100,
      },
      {
        name: 'auth',
        ttl: 60_000,
        limit: 10,
      },
    ]),

    DBModule,
    AuthModule.forRoot({ auth }),
    AuthNestModule,
    MailModule,
    UsersModule,
    InvitesModule,
    InstitutionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // ThrottlerGuard applies the default tier globally to every route.
    // Override per-route or per-controller with @Throttle() or @SkipThrottle().
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
