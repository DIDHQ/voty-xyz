import clsx from 'clsx'
import { ReactNode } from 'react'

export function Grid6(props: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('grid grid-cols-6 gap-6', props.className)}>
      {props.children}
    </div>
  )
}

export function GridItem6(props: { children: ReactNode }) {
  return <div className="col-span-6 sm:col-span-6">{props.children}</div>
}

export function GridItem3(props: { children: ReactNode }) {
  return <div className="col-span-6 sm:col-span-3">{props.children}</div>
}

export function GridItem2(props: { children: ReactNode }) {
  return <div className="col-span-6 sm:col-span-6">{props.children}</div>
}
