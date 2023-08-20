import { ReactNode } from 'react'
import { clsxMerge } from '@/src/utils/tailwind-helper';

export function DetailList(props: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{props.title}</h3>
      <dl className="mt-2 border-t">{props.children}</dl>
    </div>
  )
}

export function DetailItem(props: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <dl 
      className="flex justify-between gap-8 py-[6px]">
      <dt 
        className="shrink-0 truncate text-sm-regular text-subtle">
        {props.title}
      </dt>
      
      <dd
        className={clsxMerge(
          'min-w-0 flex-1 break-words text-right text-sm font-medium text-strong',
          props.className,
        )}>
        {props.children}
      </dd>
    </dl>
  )
}
