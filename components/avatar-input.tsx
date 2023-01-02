/* eslint-disable @next/next/no-img-element */

import Avatar from 'boring-avatars'
import { ChangeEvent, forwardRef, useCallback, useRef } from 'react'

export default forwardRef<
  HTMLSpanElement,
  {
    name: string
    value?: string
    onChange(value: string): void
  }
>(function AvatarFileInput(props, ref) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { onChange } = props
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        const reader = new FileReader()
        reader.onloadend = () => {
          onChange(reader.result as string)
        }
        reader.readAsDataURL(e.target.files[0])
      }
    },
    [onChange],
  )

  return (
    <span
      ref={ref}
      onClick={() => inputRef.current?.click()}
      style={{ cursor: 'pointer', lineHeight: 0 }}
    >
      {props.value ? (
        <img
          src={props.value}
          alt={props.name}
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
        <Avatar size={80} name={props.name} variant="pixel" />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
    </span>
  )
})
