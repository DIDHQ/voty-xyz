import clsx from 'clsx'
import Link from 'next/link'
import { ButtonHTMLAttributes, useMemo } from 'react'

export default function TextButton(
  props: ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: string
    primary?: boolean
    secondary?: boolean
  },
) {
  const { href, primary, secondary, ...restProps } = props
  const renderButton = useMemo(
    () => (
      <button
        type="button"
        {...restProps}
        className={clsx(
          'rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:text-gray-400',
          primary
            ? 'text-primary-600 hover:text-primary-500 focus:ring-primary-300'
            : secondary
            ? 'text-secondary-600 hover:text-secondary-500 focus:ring-secondary-300'
            : 'text-gray-600 hover:text-gray-500 focus:ring-gray-300',
          restProps.className,
        )}
      >
        {restProps.children}
      </button>
    ),
    [primary, secondary, restProps],
  )

  return href && !props.disabled ? (
    href.startsWith('/') || href.startsWith('#') ? (
      <Link href={href}>{renderButton}</Link>
    ) : (
      <a href={href}>{renderButton}</a>
    )
  ) : (
    renderButton
  )
}
