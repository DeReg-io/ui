export function isDateYesterday(date: Date): Boolean {
  const today = new Date();

  // Create a new date object for "yesterday".
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Compare the given date to "yesterday" by year, month, and day.
  return (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  );
}
