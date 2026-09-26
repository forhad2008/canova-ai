/**
 * Returns a time-based greeting based on the user's real device system clock.
 * 05:00 - 11:59 -> "Good Morning"
 * 12:00 - 16:59 -> "Good Afternoon"
 * 17:00 - 21:59 -> "Good Evening"
 * 22:00 - 04:59 -> "Good Night"
 */
export function getTimeBasedGreeting(): string {
  const hours = new Date().getHours();
  if (hours >= 5 && hours < 12) {
    return 'Good Morning';
  }
  if (hours >= 12 && hours < 17) {
    return 'Good Afternoon';
  }
  if (hours >= 17 && hours < 22) {
    return 'Good Evening';
  }
  return 'Good Night';
}
