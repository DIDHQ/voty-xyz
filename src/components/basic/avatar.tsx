import { useMemo } from 'react'
import { clsxMerge } from '@/src/utils/tailwind-helper'

export default function Avatar(props: {
  size?: number
  value?: string | null
  variant?: 'marble' | 'beam' | 'pixel' | 'sunset' | 'ring' | 'bauhaus'
  className?: string
}) {
  const size = props.size ? `${props.size / 4}rem` : ''
  const style = useMemo(
    () => ({
      width: size,
      height: size
    }),
    [size],
  )
  const className = clsxMerge(
    'overflow-hidden bg-base object-cover ring-1 ring-base shrink-0 rounded-full',
    props.className,
  )

  return props.value ? (
    <img
      src={props.value}
      alt={props.value}
      width={size}
      height={size}
      style={style}
      className={className}
    />
  ) : (
    <div style={style} className={className} />
  )
}
