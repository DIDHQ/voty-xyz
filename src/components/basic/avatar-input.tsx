import { ChangeEvent, MouseEvent, useCallback, useRef } from 'react'
import imageCompression from 'browser-image-compression'

import Avatar from './avatar'
import TextButton from './text-button'

export default function AvatarInput(props: {
  name?: string
  value?: string
  onChange?: (value?: string) => void
  disabled?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { onChange } = props
  const handleChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        const reader = new FileReader()
        reader.onloadend = () => {
          onChange?.(reader.result as string)
        }
        reader.readAsDataURL(
          await imageCompression(e.target.files[0], {
            maxSizeMB: 0.05,
            maxWidthOrHeight: 320,
          }),
        )
      }
    },
    [onChange],
  )
  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement | HTMLSpanElement>) => {
      e.stopPropagation()
      inputRef.current?.click()
    },
    [],
  )

  return (
    <div>
      <span className="h-20 w-20 overflow-hidden rounded-full bg-gray-100">
        <Avatar size={20} name={props.name} value={props.value} />
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      {props.disabled ? null : (
        <TextButton onClick={handleClick} className="mt-1">
          Change
        </TextButton>
      )}
    </div>
  )
}
