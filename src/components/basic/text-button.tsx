import { clsx } from 'clsx'
import { ButtonHTMLAttributes } from 'react'

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
      className={clsx(
        'rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:text-gray-400',
        primary
          ? 'text-primary-600 hover:text-primary-500 focus:ring-primary-300'
          : secondary
          ? 'text-secondary-600 hover:text-secondary-500 focus:ring-secondary-300'
          : white
          ? 'text-gray-100 hover:text-gray-50 focus:ring-gray-300'
          : 'text-gray-600 hover:text-gray-500 focus:ring-gray-300',
        restProps.className,
      )}
    />
  )
}
