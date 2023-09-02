import { ReactNode } from 'react'
import { Bars3BottomLeftIcon } from '@heroicons/react/24/outline'
import { clsxMerge } from '../utils/tailwind-helper'
import Card from './basic/card'

export default function EmptyState(props: {
  icon?: ReactNode
  title: string
  description?: string
  footer?: ReactNode
  className?: string
}) {
  return (
    <Card
      className={clsxMerge(
        'flex flex-col items-center space-y-6',
        props.className,
      )}
      size="medium"
    >
      {props.icon || (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/10 text-primary-500">
          <Bars3BottomLeftIcon className="h-8 w-8" />
        </div>
      )}

      <div className="flex max-w-xl flex-col items-center space-y-2">
        <h3 className="text-md-semibold text-strong">{props.title}</h3>

        {props.description ? (
          <p className="text-center text-sm-regular text-subtle">
            {props.description}
          </p>
        ) : null}
      </div>
      {props.footer}
    </Card>
  )
}
