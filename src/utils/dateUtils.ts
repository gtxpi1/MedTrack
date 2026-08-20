import { TimeOfDay } from '../types/medication';

/**
 * Format a Date object or ISO string into a human-readable date string.
 * Example: "Thursday, August 20, 2026"
 */
export function formatHeaderDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

/**
 * Format a 24-hour time string "08:00" or "20:30" into 12-hour format "8:00 AM" or "8:30 PM"
 */
export function formatTime12h(time24: string): string {
  if (!time24) return '';
  const [hourStr, minuteStr] = time24.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr || '0', 10);

  if (isNaN(hour)) return time24;

  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const displayMinute = minute < 10 ? `0${minute}` : minute;

  return `${displayHour}:${displayMinute} ${ampm}`;
}

/**
 * Get ISO date string (YYYY-MM-DD) for a given date
 */
export function getIsoDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Determine TimeOfDay bucket for a given 24-hour time string
 */
export function getTimeOfDayFromTimeStr(time24: string): TimeOfDay {
  if (!time24) return 'morning';
  const hour = parseInt(time24.split(':')[0], 10);

  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'bedtime';
}

/**
 * Friendly greeting based on current local hour
 */
export function getDayPeriodGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Relative time label (e.g. "Taken at 8:05 AM", "Taken 10 mins ago")
 */
export function formatTakenTime(isoTimestamp?: string): string {
  if (!isoTimestamp) return '';
  const date = new Date(isoTimestamp);
  return formatTime12h(`${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`);
}
