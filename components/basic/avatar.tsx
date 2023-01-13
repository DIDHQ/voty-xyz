/* eslint-disable @next/next/no-img-element */

import BoringAvatar from 'boring-avatars'

export default function Avatar(props: {
  size: number
  name?: string
  value?: string
}) {
  return props.value ? (
    <img
      src={props.value}
      alt={props.name}
      className={`w-${props.size} h-${props.size} object-cover`}
    />
  ) : (
    <BoringAvatar size={props.size * 4} name={props.name} />
  )
}
