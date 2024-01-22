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
// Hàm chuyển số phút sang mili giây
export function minutesToMilliseconds(minutes) {
  // Kiểm tra xem 'minutes' có phải là một số không
  if (typeof minutes !== 'number') {
    throw new Error(`Tham số ${minutes} phải là một số.`)
  }

  // Chuyển đổi số phút sang mili giây
  const milliseconds = minutes * 60 * 1000

  // Trả về số mili giây
  return milliseconds
}
export default dayjs
