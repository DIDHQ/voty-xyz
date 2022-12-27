/* eslint-disable @next/next/no-img-element */

import Avatar from 'boring-avatars'
import { useRef } from 'react'

export default function AvatarUploader(props: {
  value?: string
  onChange(value: string): void
}) {
  const ref = useRef<HTMLInputElement>(null)

  return (
    <>
      {props.value ? (
        <img
          src={props.value.replace('ar://', 'https://arweave.net/')}
          alt="avatar"
          width={80}
          height={80}
          style={{ width: 80, height: 80 }}
          onClick={ref.current?.click}
        />
      ) : (
        <Avatar size={80} variant="pixel" />
      )}
      <input
        ref={ref}
        type="file"
        accept="image/png"
        style={{ display: 'none' }}
      />
    </>
  )
}
