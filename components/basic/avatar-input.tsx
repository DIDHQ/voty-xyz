import { ChangeEvent, MouseEvent, useCallback, useRef } from 'react'

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
  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement | HTMLSpanElement>) => {
      e.stopPropagation()
      inputRef.current?.click()
    },
    [],
  )

  return (
    <div className="flex items-center">
      <span className="h-12 w-12 overflow-hidden rounded-full bg-gray-100">
        <Avatar size={12} name={props.name} value={props.value} />
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      <TextButton onClick={handleClick} className="ml-4">
        {props.disabled ? 'View' : 'Edit'}
      </TextButton>
    </div>
  )
}
