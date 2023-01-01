/* eslint-disable @next/next/no-img-element */

import Avatar from 'boring-avatars'
import { forwardRef, useRef } from 'react'

export default forwardRef<
  HTMLDivElement,
  {
    did: string
    value?: string
    onChange(value: string): void
  }
>(function AvatarFileInput(props, ref) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <span
      ref={ref}
      onClick={() => inputRef.current?.click()}
      style={{ cursor: 'pointer', lineHeight: 0 }}
    >
      {props.value ? (
        <img
          src={props.value}
          alt={props.did}
          width={80}
          height={80}
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <Avatar size={80} name={props.did} variant="pixel" />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={async (e) => {
          if (e.target.files?.[0]) {
            const reader = new FileReader()
            reader.onloadend = () => {
              props.onChange(reader.result as string)
            }
            reader.readAsDataURL(e.target.files[0])
          }
        }}
      />
    </span>
  )
})
