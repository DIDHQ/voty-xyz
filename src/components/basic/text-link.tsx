import clsx from 'clsx'
import Link from 'next/link'
import { AnchorHTMLAttributes, useMemo } from 'react'

export default function TextLink(
  props: AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
    disabled?: boolean
    primary?: boolean
    secondary?: boolean
    white?: boolean
    underline?: boolean
  },
) {
  const { href, disabled, primary, secondary, white, underline, ...restProps } =
    props
  const className = useMemo(
    () =>
      clsx(
        'break-all rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2',
        primary
          ? 'text-primary-600 hover:text-primary-500 focus:ring-primary-300'
          : secondary
          ? 'text-secondary-600 hover:text-secondary-500 focus:ring-secondary-300'
          : white
          ? 'text-gray-100 hover:text-gray-50 focus:ring-gray-300'
          : 'text-gray-600 hover:text-gray-500 focus:ring-gray-300',
        underline ? 'underline' : 'no-underline',
        disabled ? 'cursor-not-allowed text-gray-400' : undefined,
        restProps.className,
      ),
    [disabled, primary, restProps.className, secondary, underline, white],
  )

  return props.disabled ? (
    <span {...restProps} className={className} />
  ) : href.startsWith('/') || href.startsWith('#') ? (
    <Link href={href} {...restProps} className={className} />
  ) : (
    <a href={href} {...restProps} className={className} />
  )
}
