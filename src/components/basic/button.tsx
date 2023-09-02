import { clsx } from 'clsx'
import { ButtonHTMLAttributes, ExoticComponent } from 'react'
import { tv } from 'tailwind-variants'
import { clsxMerge } from '@/src/utils/tailwind-helper'

// eslint-disable-next-line tailwindcss/no-custom-classname
const button = tv({
  slots: {
    base: 'group flex items-center justify-center gap-2 rounded-xl border font-medium shadow-base transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-80',
    loader: '-ml-1 h-5 w-5 animate-spin text-white',
  },
  variants: {
    color: {
      default:
        'border-[#2D2E2E] bg-[#2f2f2f] text-white enabled:hover:bg-[#1E2022]',
      primary:
        'border-transparent bg-primary-500 text-white enabled:hover:bg-primary-600',
    },
    size: {
      default: 'h-9 px-4 text-sm',
      large: 'h-10 px-4 text-base',
      small: 'h-8 px-4 text-sm',
    },
    outline: {
      true: 'bg-transparent',
    },
    square: {
      true: 'px-0',
    },
  },
  compoundVariants: [
    {
      color: 'default',
      outline: true,
      class: 'border-base text-strong enabled:hover:bg-base',
    },
    {
      color: 'primary',
      outline: true,
      class:
        'border-2 border-primary-500 text-primary-500 enabled:hover:bg-primary-500/5',
    },
    {
      size: 'default',
      square: true,
      class: 'w-9',
    },
    {
      size: 'large',
      square: true,
      class: 'w-10',
    },
    {
      size: 'small',
      square: true,
      class: 'w-8',
    },
  ],
  compoundSlots: [
    {
      slots: ['loader'],
      color: 'default',
      outline: true,
      class: 'text-strong',
    },
    {
      slots: ['loader'],
      color: 'primary',
      outline: true,
      class: 'text-primary-500',
    },
  ],
})

export default function Button(
  props: ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: ExoticComponent<{ className?: string }>
    primary?: boolean
    loading?: boolean
    size?: 'default' | 'large' | 'small'
    outline?: boolean
  },
) {
  const {
    icon: Icon,
    primary = false,
    loading = false,
    size = 'default',
    disabled,
    outline = false,
    children,
    className,
    ...restProps
  } = props

  const color = primary ? 'primary' : 'default'
  const square = !children && Icon ? true : false

  const { base: buttonClass, loader: loaderClass } = button({
    color: color,
    size: size,
    outline: outline,
    square: square,
  })

  return (
    <button
      {...restProps}
      disabled={loading || disabled}
      className={clsxMerge(buttonClass(), className)}
    >
      {loading ? (
        <svg
          className={loaderClass()}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : Icon ? (
        <Icon className={clsx(children ? '-ml-1' : undefined, 'h-5 w-5')} />
      ) : null}

      {children}
    </button>
  )
}
