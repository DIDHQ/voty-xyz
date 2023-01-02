import { CSSProperties, useEffect, useState } from 'react'

export default function JsonInput<T>(props: {
  value: T
  onChange(value: T): void
  style?: CSSProperties
}) {
  const [text, setText] = useState('')
  const [error, setError] = useState<Error>()
  useEffect(() => {
    setText(JSON.stringify(props.value, null, 2))
  }, [props.value])

  return (
    <>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          try {
            props.onChange(JSON.parse(text))
            setError(undefined)
          } catch (err) {
            if (err instanceof Error) {
              setError(err)
            }
          }
        }}
        style={props.style}
      />
      {error ? <label>{error.message}</label> : null}
    </>
  )
}
