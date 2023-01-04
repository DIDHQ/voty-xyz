/* eslint-disable @next/next/no-img-element */

import { Delete } from '@icon-park/react'
import Avatar from 'boring-avatars'
import { ChangeEvent, forwardRef, useCallback, useRef } from 'react'
import { Button } from 'react-daisyui'

export default forwardRef<
  HTMLSpanElement,
  {
    size?: number
    name?: string
    value?: string
    onChange?: (value?: string) => void
    disabled?: boolean
  }
>(function AvatarFileInput(props, ref) {
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
  const size = props.size || 80

  return (
    <>
      <span
        ref={ref}
        onClick={() => (props.disabled ? undefined : inputRef.current?.click())}
        style={{
          cursor: props.disabled ? 'default' : 'pointer',
          lineHeight: 0,
          width: size,
          height: size,
        }}
      >
        {props.value ? (
          <img
            src={props.value}
            alt={props.name}
            width={size}
            height={size}
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Avatar size={size} name={props.name} variant="pixel" />
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
})
