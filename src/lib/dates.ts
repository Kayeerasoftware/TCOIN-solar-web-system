const TZ = 'Africa/Kampala';

/** Stored in UTC; shown in Kampala time, e.g. "10 October 2026". Date format is configurable in documents.options. */
export function formatDate(iso: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ }).format(new Date(iso));
}
export function formatDateTime(iso: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: TZ }).format(new Date(iso));
}
