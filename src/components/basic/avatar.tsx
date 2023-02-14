import clsx from 'clsx'
import dynamic from 'next/dynamic'

const BoringAvatar = dynamic(() => import('boring-avatars'), { ssr: false })

export default function Avatar(props: {
  size: number
  name?: string
  value?: string
  className?: string
}) {
  const size = `${props.size / 4}rem`

  return props.value ? (
    <img
      src={props.value}
      alt={props.name}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={clsx('rounded-full object-cover', props.className)}
    />
  ) : (
    <div
      className={clsx(
        'overflow-hidden rounded-full bg-gray-200',
        props.className,
      )}
    >
      {props.name ? (
        <BoringAvatar size={size} name={props.name} />
      ) : (
        <div style={{ width: size, height: size }} />
      )}
    </div>
  )
}
