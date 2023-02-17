import clsx from 'clsx'
import dynamic from 'next/dynamic'

const BoringAvatar = dynamic(() => import('boring-avatars'), { ssr: false })

export default function Avatar(props: {
  size: number
  name?: string
  value?: string
  variant?: 'marble' | 'beam' | 'pixel' | 'sunset' | 'ring' | 'bauhaus'
  square?: boolean
  className?: string
}) {
  const size = `${props.size / 4}rem`
  const borderRadius = props.square
    ? `${props.size / 16}rem`
    : `${props.size / 8}rem`

  return props.value ? (
    <img
      src={props.value}
      alt={props.name}
      width={size}
      height={size}
      style={{ width: size, height: size, borderRadius }}
      className={clsx('object-cover', props.className)}
    />
  ) : (
    <div
      style={{ width: size, height: size, borderRadius }}
      className={clsx('overflow-hidden bg-gray-200', props.className)}
    >
      {props.name ? (
        <BoringAvatar
          size={size}
          name={props.name}
          variant={props.variant}
          square
        />
      ) : null}
    </div>
  )
}
