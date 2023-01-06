/* eslint-disable @next/next/no-img-element */

import { Delete, Edit } from '@icon-park/react'
import Avatar from 'boring-avatars'
import React, { ChangeEvent, useCallback, useRef } from 'react'
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

  const handleEdit = useCallback(
    (e: React.MouseEvent<HTMLButtonElement | HTMLSpanElement>) => {
      e.stopPropagation()
      inputRef.current?.click()
    },
    [],
  )

  const handleDelete = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      onChange?.(undefined)
    },
    [onChange],
  )

  return (
    <>
      <span
        className="relative group block rounded-full"
        onClick={props.disabled ? undefined : handleEdit}
        style={{
          cursor: props.disabled ? 'default' : 'pointer',
          pointerEvents: props.disabled ? 'none' : 'unset',
          lineHeight: 0,
          width: props.size,
          height: props.size,
        }}
      >
        <span className="text-primary-content z-10 rounded-full absolute left-0 top-0 justify-center items-center w-full h-full transition-all ease-out flex opacity-0 group-hover:bg-neutral group-hover:opacity-70">
          Edit
        </span>
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
          <div
            className="h-full rounded-full"
            style={{ clipPath: 'circle(50%)' }}
          >
            <Avatar
              size={props.size}
              name={props.name}
              variant={props.variant}
            />
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleChange}
        />
        {props.disabled ? null : (
          <Button
            className="absolute right-0 bottom-0 hover:brightness-200 z-20"
            size="xs"
            shape="circle"
            onClick={props.value ? handleDelete : handleEdit}
          >
            {props.value ? <Delete size={10} /> : <Edit size={10} />}
          </Button>
        )}
      </span>
    </>
  )
}
