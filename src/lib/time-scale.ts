export function createTimeScale(
  totalMinutes: number,
  chartWidth: number,
  startMinute: number = 0
): (minute: number) => number {
  const range = totalMinutes - startMinute;
  if (range <= 0) return () => 0;
  return (minute: number) => ((minute - startMinute) / range) * chartWidth;
}

export function minuteToLabel(minute: number): string {
  const mins = Math.floor(minute);
  const secs = Math.round((minute - mins) * 60);
  if (secs === 0) return `${mins}:00`;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
