import clsx from 'clsx'
import dynamic from 'next/dynamic'
import { useMemo } from 'react'

const BoringAvatar = dynamic(() => import('boring-avatars'), { ssr: false })

export default function Avatar(props: {
  size: number
  name?: string
  value?: string
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

  return props.value ? (
    <img
      src={props.value}
      alt={props.name}
      width={size}
      height={size}
      style={style}
      className={clsx('object-cover', props.className)}
    />
  ) : (
    <div
      style={style}
      className={clsx('overflow-hidden bg-gray-200', props.className)}
    >
      {props.name ? (
        <BoringAvatar size={size} name={props.name} variant={props.variant} />
      ) : null}
    </div>
  )
}
