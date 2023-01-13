import { ChangeEvent, MouseEvent, useCallback, useRef } from 'react'

import Avatar from './avatar'

export default function AvatarFileInput(props: {
  name?: string
  value?: string
  onChange?: (value?: string) => void
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
      <button
        type="button"
        onClick={handleClick}
        className="ml-5 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Change
      </button>
    </div>
  )
}
