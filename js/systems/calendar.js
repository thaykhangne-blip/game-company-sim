import { MONTH_NAMES } from "../data/config.js";

export function getCurrentPeriod(calendar) {
  return { monthName: MONTH_NAMES[calendar.month - 1], year: calendar.year };
}

export function advanceCalendar(calendar) {
  calendar.month += 1;
  calendar.monthCount += 1;
  if (calendar.month > 12) {
    calendar.month = 1;
    calendar.year += 1;
  }
  return getCurrentPeriod(calendar);
}