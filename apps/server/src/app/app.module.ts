import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { AppController } from '@/app/app.controller';
import { AppService } from '@/app/app.service';
import { DBModule } from '@/db/db.module';
import { AuthNestModule } from '@/auth/auth.nest.module';
import { UsersModule } from '@/users/users.module';
import { auth } from '@/auth/auth';

@Module({
  imports: [
    // Env vars — global so ConfigService works anywhere in the DI tree
    ConfigModule.forRoot({ isGlobal: true }),

    // Drizzle db instance — global so any module can inject DBService
    DBModule,

    // better-auth HTTP handler + global AuthGuard (all routes protected by default)
    AuthModule.forRoot({ auth }),

    // Scholaid auth layer: AuthService + ScholaidRoleGuard (global APP_GUARD)
    AuthNestModule,

    // Feature modules
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
