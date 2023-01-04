import { ReactNode } from 'react'

export default function FormItem(props: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="form-control w-full max-w-xs">
      <label className="label">{props.label}</label>
      {props.children}
    </div>
  )
}
