import type { ScheduleDay } from "@/types/jikan";

const DAYS: ScheduleDay[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

/** The current weekday as a Jikan `/schedules?filter=` value. */
export function getTodayDay(date: Date = new Date()): ScheduleDay {
  return DAYS[date.getDay()];
}
