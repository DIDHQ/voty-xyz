import { ButtonHTMLAttributes } from 'react'
import { clsxMerge } from '@/src/utils/tailwind-helper'

export default function TextButton(
  props: ButtonHTMLAttributes<HTMLButtonElement> & {
    primary?: boolean
    secondary?: boolean
    white?: boolean
  },
) {
  const { primary, secondary, white, ...restProps } = props

  return (
    <button
      type="button"
      {...restProps}
      className={clsxMerge(
        'inline-flex items-center rounded-md text-sm font-medium focus:outline-none disabled:cursor-not-allowed disabled:opacity-80 transition',
        primary
          ? 'text-primary-500 enabled:hover:text-primary-600'
          : secondary
          ? 'text-secondary-600 enabled:hover:text-secondary-500'
          : white
          ? 'text-gray-100 enabled:hover:text-gray-50'
          : 'text-moderate enabled:hover:text-strong',
        restProps.className,
      )}
    />
  )
}
