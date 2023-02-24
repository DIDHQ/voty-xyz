import clsx from 'clsx'
import dynamic from 'next/dynamic'
import { useMemo } from 'react'

const BoringAvatar = dynamic(() => import('boring-avatars'), { ssr: false })

export default function Avatar(props: {
  size: number
  name?: string
  value?: string | null
  variant?: 'marble' | 'beam' | 'pixel' | 'sunset' | 'ring' | 'bauhaus'
  noRing?: boolean
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
    'overflow-hidden bg-gray-50 object-cover',
    props.noRing ? undefined : 'ring-1 ring-gray-200',
    props.className,
  )

  return props.value ? (
    <img
      src={props.value}
      alt={props.name}
      width={size}
      height={size}
      style={style}
      className={className}
    />
  ) : (
    <div style={style} className={className}>
      {props.name ? (
        <BoringAvatar size={size} name={props.name} variant={props.variant} />
      ) : null}
    </div>
  )
}
