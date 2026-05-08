import { Module } from '@nestjs/common';
import { InvitesController } from '@/invites/invites.controller';
import { InvitesService } from '@/invites/invites.service';
import { DBModule } from '@/db/db.module';

@Module({
  imports: [DBModule],
  controllers: [InvitesController],
  providers: [InvitesService],
})
export class InvitesModule {}
