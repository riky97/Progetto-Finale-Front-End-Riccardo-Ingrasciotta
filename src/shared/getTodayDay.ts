import type { ScheduleDay } from "@/types/anilist";

const DAYS: ScheduleDay[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

/**
 * The current weekday. AniList has no weekday filter, so this feeds
 * `weekdayWindow()` in the API layer, which turns it into a unix time range
 * for `Page.airingSchedules`.
 */
export function getTodayDay(date: Date = new Date()): ScheduleDay {
  return DAYS[date.getDay()];
}
