import dayjs, { extend } from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'

extend(duration)
extend(relativeTime)

export function formatDuration(seconds: number) {
  return dayjs
    .duration(seconds, 'seconds')
    .humanize()
    .replace(/^a /, '1 ')
    .replace(/^an /, '1 ')
    .replace(/^1 few /, 'a few ')
}

export function formatDurationMs(ms: number) {
  return dayjs
    .duration(ms, 'milliseconds')
    .humanize()
    .replace(/^a /, '1 ')
    .replace(/^an /, '1 ')
    .replace(/^1 few /, 'a few ')
}

export function formatTime(date: Date | string | number) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

export function format2Time(
  from: Date | string | number,
  to: Date | string | number,
) {
  return `${dayjs(from).format('YYYY-MM-DD HH:mm')} ~ ${dayjs(to).format(
    'YYYY-MM-DD HH:mm',
  )}`
}
