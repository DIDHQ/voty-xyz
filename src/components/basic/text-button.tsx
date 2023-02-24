import clsx from 'clsx'
import Link from 'next/link'
import { ButtonHTMLAttributes, useMemo } from 'react'

export default function TextButton(
  props: ButtonHTMLAttributes<HTMLButtonElement> & { href?: string },
) {
  const { href, ...restProps } = props
  const renderButton = useMemo(
    () => (
      <button
        type="button"
        {...restProps}
        className={clsx(
          'rounded text-sm font-medium text-primary-600 hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:text-gray-400',
          restProps.className,
        )}
      >
        {restProps.children}
      </button>
    ),
    [restProps],
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
