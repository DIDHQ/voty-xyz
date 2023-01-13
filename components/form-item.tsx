import cx from 'clsx'
import { ReactNode } from 'react'

export default function FormItem(props: {
  label?: string
  children: ReactNode
  direction?: 'horizontal' | 'vertical'
  gap?: number
  className?: string
  error?: string
}) {
  const { className } = props

  return (
    <div
      className={cx(
        cx({
          'form-control flex': true,
          'flex-row': props.direction === 'horizontal',
        }),
        className,
      )}
    >
      {props.label ? (
        <label className="label whitespace-nowrap block">{props.label}</label>
      ) : null}
      {props.children}
      {props.error ? <p className="mt-2 text-error">{props.error}</p> : null}
    </div>
  )
}
