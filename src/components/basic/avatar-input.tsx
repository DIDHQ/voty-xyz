import { ChangeEvent, MouseEvent, Ref, useCallback, useRef } from 'react'
import imageCompression from 'browser-image-compression'
import { mergeRefs } from 'react-merge-refs'

import Avatar from './avatar'
import Button from './button'

export default function AvatarInput(props: {
  inputRef: Ref<HTMLInputElement>
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
    <div className="flex items-center">
      <Avatar size={16} value={props.value} />
      <input
        ref={mergeRefs([inputRef, props.inputRef])}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden h-0 w-0"
      />
      {props.disabled ? null : (
        <Button onClick={handleClick} className="ml-4">
          Change
        </Button>
      )}
    </div>
  )
}
