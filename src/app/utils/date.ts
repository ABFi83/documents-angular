// An empty locale (no `lang` on <html>) falls back to the browser's default.
/** `2026-11-20T15:04:05` (UTC sent without a zone) as local date and time, e.g. `20 nov 2026, 16:04`. */
export function formatDateTime(iso: string, locale: string): string {
  const utc = /[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`;
  return new Date(utc).toLocaleString(locale || undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

/** `2020-09-01` as month and year, e.g. `set 2020`. The date is a calendar day: no zone shift. */
export function formatMonth(isoDate: string, locale: string): string {
  return new Date(isoDate).toLocaleDateString(locale || undefined, { month: 'short', year: 'numeric', timeZone: 'UTC' });
}
