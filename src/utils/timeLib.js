import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import dayOfYear from 'dayjs/plugin/dayOfYear'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(dayOfYear)
dayjs.extend(customParseFormat)
dayjs.extend(utc)
dayjs.extend(timezone)

export const timezoneCurrent = dayjs.tz.guess()

dayjs.tz.setDefault(timezoneCurrent)

export function convertTimeToIsoString(time) {
  const iso = dayjs(time, 'DD-MM-YYYY HH:mm')
  const timezoneToString = iso.tz(timezoneCurrent).toISOString()
  return timezoneToString
}
export function convertTimeToCurrentZone(time) {
  const iso = dayjs(time)
  const timezoneToString = iso.tz(timezoneCurrent).format('DD-MM-YYYY HH:mm')
  return timezoneToString
}
export default dayjs
