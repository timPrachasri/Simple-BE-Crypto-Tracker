import { DateTime } from 'luxon'

export function toUnixSecond(date: Date): number {
  return Math.floor(Math.round(date.getTime() / 1000))
}

export function formatJSDateToISO(date: Date): string {
  return DateTime.fromJSDate(date, {
    zone: 'utc',
  }).toFormat("yyyy-MM-dd'T'HH:mm:ssZZ")
}
