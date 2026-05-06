import { CalendarDate } from "@internationalized/date";

/** The three separate fields stored on a Person. */
export type BirthDateFields = {
  birthMonth: number | null;
  birthDay: number | null;
  birthYear: number | null;
};

/**
 * Convert a CalendarDate (from react-aria-components / @internationalized/date)
 * into the separate fields expected by the API.
 */
export function calendarDateToFields(
  date: CalendarDate | null,
): BirthDateFields {
  if (!date) {
    return { birthMonth: null, birthDay: null, birthYear: null };
  }
  return { birthMonth: date.month, birthDay: date.day, birthYear: date.year };
}

/**
 * Convert the separate Person fields back into a CalendarDate, or null if
 * the minimum required fields (month + day) are not present.
 */
export function fieldsToCalendarDate(
  fields: BirthDateFields,
): CalendarDate | null {
  const { birthMonth, birthDay, birthYear } = fields;
  if (!birthMonth || !birthDay) return null;
  // Use a default year (e.g. 2000) when only month/day are known.
  return new CalendarDate(birthYear ?? 2000, birthMonth, birthDay);
}

/** Format birth date fields for display. */
export function formatBirthday(fields: BirthDateFields): string {
  const { birthMonth, birthDay, birthYear } = fields;
  if (!birthMonth && !birthDay && !birthYear) return "—";
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const parts: string[] = [];
  if (birthMonth) parts.push(months[birthMonth - 1]);
  if (birthDay) parts.push(String(birthDay));
  const dateStr = parts.join(" ");
  return birthYear && birthYear !== 1900
    ? `${dateStr}, ${birthYear}`
    : dateStr || "—";
}
