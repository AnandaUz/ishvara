export function getTimeStr(date: Date | null | undefined): string {
  if (!date) return '';

  const d = new Date(date);
  const m = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
  const h = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
  return `${h}:${m}`;
}
