import { Module } from '@nestjs/common';
import { InvitesController } from '@/invites/invites.controller';
import { InvitesService } from '@/invites/invites.service';

@Module({
  controllers: [InvitesController],
  providers: [InvitesService],
})
export class InvitesModule {}
