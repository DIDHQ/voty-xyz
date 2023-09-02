import { clsxMerge } from '../utils/tailwind-helper'
import Tag from './basic/tag'

export function PhaseInfo(props: {
  status: string
  statusColor?:
    | 'default'
    | 'primary'
    | 'highlight'
    | 'blue'
    | 'green'
    | 'yellow'
  statusLabel?: string
  time: string
  timeLabel?: string
  className?: string
  children?: React.ReactNode
}) {
  const {
    status,
    statusColor = 'default',
    statusLabel = 'Status',
    time,
    timeLabel = 'Time',
    className,
    children,
  } = props

  return (
    <div className={clsxMerge('space-y-5', className)}>
      <PhaseInfoSection title={statusLabel}>
        <Tag color={statusColor}>{status}</Tag>
      </PhaseInfoSection>

      <PhaseInfoSection title={timeLabel}>
        <div className="text-sm font-medium text-strong">{time}</div>
      </PhaseInfoSection>

      {children}
    </div>
  )
}

export function PhaseInfoSection(props: {
  title: string
  className?: string
  children?: React.ReactNode
}) {
  const { title, className, children } = props

  return (
    <div className={className}>
      <h4 className="mb-2 text-sm font-medium text-moderate">{title}</h4>

      {children}
    </div>
  )
}
