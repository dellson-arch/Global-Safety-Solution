import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AutomationsService } from './automations.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [AutomationsService],
})
export class AutomationsModule {}
