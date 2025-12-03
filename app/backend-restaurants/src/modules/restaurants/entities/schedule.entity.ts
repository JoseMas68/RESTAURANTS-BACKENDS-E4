import { Schedule } from '@prisma/client';
import { ScheduleDto } from '../dto/schedule.dto';

export class ScheduleEntity {
  static fromPrisma(schedule: Schedule): ScheduleDto {
    return {
      dayOfWeek: schedule.dayOfWeek,
      openTime: schedule.openTime,
      closeTime: schedule.closeTime,
      isClosed: schedule.isClosed,
    };
  }
}
