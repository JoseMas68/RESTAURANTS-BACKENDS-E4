import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
 dayjs.extend(timezone);

export function toUtcIso(date: Date | string): string {
  return dayjs(date).utc().toISOString();
}

export function buildDateKey(date: Date | string, format = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format);
}
