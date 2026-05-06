import { Module } from '@nestjs/common';
import { AppService } from '@/app/app.service';
import { AppController } from '@/app/app.controller';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from '@/auth/auth';
import { UserController } from '@/auth/auth.controller';
import { DbModule } from '@/db/db.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DbModule,
    AuthModule.forRoot({ auth }),
  ],
  controllers: [AppController, UserController],
  providers: [AppService],
})
export class AppModule {}
