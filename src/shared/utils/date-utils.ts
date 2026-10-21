export function formatToUserDate(date: Date | string | null | undefined): string {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (Number.isNaN(d.getTime())) return '';

  const pad = (n: number) => n.toString().padStart(2, '0');

  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const year = d.getFullYear();

  const rawHours = d.getHours();
  const ampm = rawHours >= 12 ? 'PM' : 'AM';
  const hours = pad(rawHours % 12 || 12);
  const minutes = pad(d.getMinutes());

  return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
}

export function isIsoDateWithTime(dateStr: string): boolean {
  return (
    typeof dateStr === 'string' &&
    dateStr.includes('T') &&
    dateStr.includes('Z') &&
    dateStr.length > 10
  );
}
