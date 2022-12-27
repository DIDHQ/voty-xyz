/* eslint-disable @next/next/no-img-element */

import Avatar from 'boring-avatars'
import { forwardRef, useRef, useState } from 'react'

export default forwardRef<
  HTMLDivElement,
  {
    did: string
    onChange(value: ArrayBuffer): void
  }
>(function AvatarUploader(props, ref) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [blob, setBlob] = useState('')

  return (
    <div
      ref={ref}
      onClick={() => inputRef.current?.click()}
      style={{ cursor: 'pointer', width: 80, height: 80, lineHeight: 0 }}
    >
      {blob ? (
        <img
          src={blob}
          alt={props.did}
          width={80}
          height={80}
          style={{ width: 80, height: 80, borderRadius: '50%' }}
        />
      ) : (
        <Avatar size={80} name={props.did} variant="pixel" />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png"
        style={{ display: 'none' }}
        onChange={async (e) => {
          if (e.target.files?.[0]) {
            const arrayBuffer = await e.target.files[0].arrayBuffer()
            props.onChange(arrayBuffer)
            setBlob(URL.createObjectURL(new Blob([arrayBuffer])))
          }
        }}
      />
    </div>
  )
})
