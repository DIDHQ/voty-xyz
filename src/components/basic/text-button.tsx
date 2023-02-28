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
  const { href, ...restProps } = props
  const renderButton = useMemo(
    () => (
      <button
        type="button"
        {...restProps}
        className={clsx(
          'rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:text-gray-400',
          props.primary
            ? 'text-primary-600 hover:text-primary-700 focus:ring-primary-300'
            : props.secondary
            ? 'text-secondary-600 hover:text-secondary-700 focus:ring-secondary-300'
            : 'text-gray-600 hover:text-gray-700 focus:ring-gray-300',
          restProps.className,
        )}
      >
        {restProps.children}
      </button>
    ),
    [props.primary, props.secondary, restProps],
  )

  return href ? (
    href.startsWith('/') || href.startsWith('#') ? (
      <Link href={href}>{renderButton}</Link>
    ) : (
      <a href={href}>{renderButton}</a>
    )
  ) : (
    renderButton
  )
}
