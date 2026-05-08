import { Module } from '@nestjs/common';
import { DBModule } from '@/db/db.module';
import { InstitutionsController } from '@/institutions/institutions.controller';
import { InstitutionsService } from '@/institutions/institutions.service';

@Module({
  imports: [DBModule],
  controllers: [InstitutionsController],
  providers: [InstitutionsService],
})
export class InstitutionsModule {}
