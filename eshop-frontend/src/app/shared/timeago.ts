export function format(date: any, locale = 'en_US'): string {
  if (!date) return '';
  const then = new Date(date).getTime();
  if (isNaN(then)) return '';
  const seconds = Math.round((Date.now() - then) / 1000);
  const abs = Math.abs(seconds);
  const units: [number, string][] = [[60, 'second'], [60, 'minute'], [24, 'hour'], [30, 'day'], [12, 'month'], [Infinity, 'year']];
  let value = abs; let unit = 'second';
  for (const [limit, name] of units) { if (value < limit) { unit = name; break; } value = value / limit; unit = name; }
  value = Math.floor(value);
  if (unit === 'second') value = Math.max(value, 1);
  const plural = value === 1 ? unit : unit + 's';
  return seconds >= 0 ? `${value} ${plural} ago` : `in ${value} ${plural}`;
}
