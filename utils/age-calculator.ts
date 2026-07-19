import dayjs from 'dayjs';

export interface AgeCalculationResult {
  years: number;
  months: number;
  days: number;
  weeks: number;
  remainingDays: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
}

/**
 * Calculates the age differences between two dates in multiple formats.
 * @param fromDate The starting date (e.g., date of birth)
 * @param toDate The target date (defaults to today)
 */
export function calculateAge(fromDate: Date, toDate: Date): AgeCalculationResult {
  const from = dayjs(fromDate).startOf('day');
  const to = dayjs(toDate).startOf('day');

  // Exact Years, Months, Days breakdown
  let years = to.diff(from, 'year');
  let tempDate = from.add(years, 'year');
  
  let months = to.diff(tempDate, 'month');
  tempDate = tempDate.add(months, 'month');
  
  let days = to.diff(tempDate, 'day');

  // Total days/weeks breakdown
  const totalDays = to.diff(from, 'day');
  const weeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;
  
  // Use the exact date-time differences for hours/minutes/seconds
  const fromTime = dayjs(fromDate);
  const toTime = dayjs(toDate);
  
  const totalHours = toTime.diff(fromTime, 'hour');
  const totalMinutes = toTime.diff(fromTime, 'minute');
  const totalSeconds = toTime.diff(fromTime, 'second');

  return {
    years,
    months,
    days,
    weeks,
    remainingDays,
    totalDays,
    totalHours,
    totalMinutes,
    totalSeconds,
  };
}
