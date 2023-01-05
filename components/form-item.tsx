import { ReactNode } from 'react'
import clsx from 'clsx'

export default function FormItem(props: {
  label: string
  children: ReactNode
  direction?: 'horizontal' | 'vertical'
  gap?: number
  className?: string
}) {
  const { className } = props
  const cls = clsx({
    'form-control flex': true,
    'flex-row': props.direction === 'horizontal',
    [`gap-${props.gap}`]: props.gap,
  })

  return (
    <div className={clsx(cls, className)}>
      <label className="label whitespace-nowrap">{props.label}</label>
      {props.children}
    </div>
  )
}
