import {
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { ReactNode, useMemo } from 'react'

export default function Alert(props: {
  type: 'info' | 'success' | 'warning' | 'error'
  children: ReactNode
  action?: string
  onClick?: () => void
  className?: string
}) {
  const Icon = useMemo(
    () =>
      ({
        info: InformationCircleIcon,
        success: CheckCircleIcon,
        warning: ExclamationTriangleIcon,
        error: XCircleIcon,
      }[props.type]),
    [props.type],
  )

  return (
    <div
      className={clsx(
        'rounded-md p-4',
        {
          'bg-blue-100': props.type === 'info',
          'bg-green-100': props.type === 'success',
          'bg-yellow-100': props.type === 'warning',
          'bg-red-100': props.type === 'error',
        },
        props.className,
      )}
    >
      <div className="flex">
        <div className="shrink-0">
          <Icon
            className={clsx('h-5 w-5', {
              'text-blue-400': props.type === 'info',
              'text-green-400': props.type === 'success',
              'text-yellow-400': props.type === 'warning',
              'text-red-400': props.type === 'error',
            })}
            aria-hidden="true"
          />
        </div>
        <div className="ml-3 flex-1 sm:flex sm:justify-between">
          <p
            className={clsx('text-sm', {
              'text-blue-700': props.type === 'info',
              'text-green-700': props.type === 'success',
              'text-yellow-700': props.type === 'warning',
              'text-red-700': props.type === 'error',
            })}
          >
            {props.children}
          </p>
          {props.action ? (
            <p
              className={clsx(
                props.onClick ? 'cursor-pointer' : undefined,
                'mt-3 text-sm sm:mt-0 sm:ml-6',
              )}
              onClick={props.onClick}
            >
              <span
                className={clsx('whitespace-nowrap font-medium', {
                  'text-blue-700 hover:text-blue-600': props.type === 'info',
                  'text-green-700 hover:text-green-600':
                    props.type === 'success',
                  'text-yellow-700 hover:text-yellow-600':
                    props.type === 'warning',
                  'text-red-700 hover:text-red-600': props.type === 'error',
                })}
              >
                {props.action}
                <span aria-hidden="true"> &rarr;</span>
              </span>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
