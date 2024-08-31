const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function toDate(timestamp: string): Date {
  return new Date(timestamp);
}

export function getTimestampYearAndMonthAndDay(
  timestamp: Date | string
): string {
  if (timestamp instanceof Date) {
    const year = timestamp.getFullYear();
    const month = MONTH_NAMES[timestamp.getMonth()];
    const day = timestamp.getDate();
    return `${year}, ${day} ${month}`;
  } else {
    timestamp = toDate(timestamp);
    const year = timestamp.getFullYear();
    const month = MONTH_NAMES[timestamp.getMonth()];
    const day = timestamp.getDate();
    return `${year}, ${day} ${month}`;
  }
}

export function getTimestampHoursAndMinutes(timestamp: Date | string): string {
  if (timestamp instanceof Date) {
    const hours = timestamp.getHours().toString().padStart(2, "0");
    const minutes = timestamp.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  } else {
    timestamp = toDate(timestamp);
    const hours = timestamp.getHours().toString().padStart(2, "0");
    const minutes = timestamp.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }
}

export function isDifferentDays(
  timestamp1: string,
  timestamp2: string
): boolean {
  const date1 = toDate(timestamp1);
  const date2 = toDate(timestamp2);
  return (
    date1.getFullYear() != date2.getFullYear() ||
    date1.getMonth() != date2.getMonth() ||
    date1.getDay() != date2.getDay()
  );
}
