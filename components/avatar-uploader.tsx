/* eslint-disable @next/next/no-img-element */

import Avatar from 'boring-avatars'
import { forwardRef, InputHTMLAttributes, useRef } from 'react'

export default forwardRef<
  HTMLDivElement,
  {
    did: string
  } & InputHTMLAttributes<HTMLInputElement>
>(function AvatarUploader(props, ref) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { did, ...rest } = props

  return (
    <div
      ref={ref}
      onClick={() => inputRef.current?.click()}
      style={{ cursor: 'pointer', width: 80, height: 80, lineHeight: 0 }}
    >
      {props.value && typeof props.value === 'string' ? (
        <img
          src={props.value.replace('ar://', 'https://arweave.net/')}
          alt={did}
          width={80}
          height={80}
          style={{ width: 80, height: 80 }}
        />
      ) : (
        <Avatar size={80} name={did} variant="pixel" />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png"
        style={{ display: 'none' }}
        {...rest}
      />
    </div>
  )
})
