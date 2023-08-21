import Link from 'next/link'
import { AnchorHTMLAttributes, useMemo } from 'react'
import { clsxMerge } from '@/src/utils/tailwind-helper'

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
      clsxMerge(
        'break-words rounded-md font-medium transition focus:outline-none',
        primary
          ? 'text-primary-500 hover:text-primary-600'
          : secondary
          ? 'text-secondary-600 hover:text-secondary-500'
          : white
          ? 'text-gray-100 hover:text-gray-50'
          : 'text-strong hover:text-primary-500',
        underline ? 'underline' : 'no-underline',
        disabled ? 'cursor-not-allowed opacity-80' : undefined,
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
