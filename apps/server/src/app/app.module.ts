import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { AppController } from '@/app/app.controller';
import { AppService } from '@/app/app.service';
import { DBModule } from '@/db/db.module';
import { AuthNestModule } from '@/auth/auth.nest.module';
import { MailModule } from '@/mail/mail.module';
import { UsersModule } from '@/users/users.module';
import { InvitesModule } from '@/invites/invites.module';
import { auth } from '@/auth/auth';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DBModule,
    AuthModule.forRoot({ auth }),
    AuthNestModule,
    MailModule,
    UsersModule,
    InvitesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
