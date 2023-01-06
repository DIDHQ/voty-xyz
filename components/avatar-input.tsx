/* eslint-disable @next/next/no-img-element */

import { Delete } from '@icon-park/react'
import Avatar from 'boring-avatars'
import { ChangeEvent, useCallback, useRef } from 'react'
import { Button } from 'react-daisyui'

export default function AvatarFileInput(props: {
  size: number | string
  name?: string
  value?: string
  variant?: 'marble' | 'beam' | 'pixel' | 'sunset' | 'ring' | 'bauhaus'
  onChange?: (value?: string) => void
  disabled?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { onChange } = props
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        const reader = new FileReader()
        reader.onloadend = () => {
          onChange?.(reader.result as string)
        }
        reader.readAsDataURL(e.target.files[0])
      }
    },
    [onChange],
  )

  return (
    <>
      <span
        onClick={() => (props.disabled ? undefined : inputRef.current?.click())}
        style={{
          cursor: props.disabled ? 'default' : 'pointer',
          pointerEvents: props.disabled ? 'none' : 'unset',
          lineHeight: 0,
          width: props.size,
          height: props.size,
        }}
      >
        {props.value ? (
          <img
            src={props.value}
            alt={props.name}
            style={{
              width: props.size,
              height: props.size,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Avatar size={props.size} name={props.name} variant={props.variant} />
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleChange}
        />
      </span>
      {props.disabled ? null : (
        <Button size="xs" shape="circle" onClick={() => onChange?.(undefined)}>
          <Delete size={10} />
        </Button>
      )}
    </>
  )
}
