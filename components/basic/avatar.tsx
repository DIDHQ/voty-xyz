import BoringAvatar from 'boring-avatars'
import clsx from 'clsx'

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
    <div className={clsx('overflow-hidden rounded-full', props.className)}>
      <BoringAvatar size={size} name={props.name} />
    </div>
  )
}
