import { clsx } from 'clsx'
import { useMemo } from 'react'

export default function Avatar(props: {
  size: number
  value?: string | null
  variant?: 'marble' | 'beam' | 'pixel' | 'sunset' | 'ring' | 'bauhaus'
  className?: string
}) {
  const size = `${props.size / 4}rem`
  const borderRadius = `${props.size / 8}rem`
  const style = useMemo(
    () => ({
      width: size,
      height: size,
      borderRadius,
    }),
    [borderRadius, size],
  )
  const className = clsx(
    'overflow-hidden bg-gray-50 object-cover ring-1 ring-gray-200',
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
