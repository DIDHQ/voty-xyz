import BoringAvatar from 'boring-avatars'
import clsx from 'clsx'

export default function Avatar(props: {
  size: number
  name?: string
  value?: string
  className?: string
}) {
  return props.value ? (
    <img
      src={props.value}
      alt={props.name}
      width={props.size * 4}
      height={props.size * 4}
      style={{ maxWidth: 'unset', height: 'unset' }}
      className={clsx('object-cover rounded-full', props.className)}
    />
  ) : (
    <div className={clsx('rounded-full overflow-hidden', props.className)}>
      <BoringAvatar size={props.size * 4} name={props.name} />
    </div>
  )
}
