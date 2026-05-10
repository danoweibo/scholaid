import { Module } from '@nestjs/common';
import { DBModule } from '@/db/db.module';
import { MatricController } from '@/matric/matric.controller';
import { MatricService } from '@/matric/matric.service';

@Module({
  imports: [DBModule],
  controllers: [MatricController],
  providers: [MatricService],
})
export class MatricModule {}
