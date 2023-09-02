import { tv } from 'tailwind-variants'
import { clsxMerge } from '@/src/utils/tailwind-helper'

const tagClass = tv({
  base: 'inline-flex items-center text-sm font-medium',
  variants: {
    color: {
      default: 'bg-moderate text-semistrong',
      primary: 'bg-primary-500/5 text-primary-500',
      highlight: 'bg-myyellow-100 text-amber-700',
      green: 'bg-mygreen-100 text-mygreen-900',
      blue: 'bg-myblue-100 text-myblue-900',
      yellow: 'bg-myyellow-100 text-myyellow-900',
    },
    size: {
      default: 'gap-1 px-3 py-1',
      large: 'gap-2 px-4 py-[10px]',
      small: 'gap-0.5 px-2 py-1 text-xs',
    },
    round: {
      true: 'rounded-full',
      false: 'rounded-lg',
    },
  },
})

export default function Tag(props: {
  color?: 'default' | 'primary' | 'highlight' | 'blue' | 'green' | 'yellow'
  round?: boolean
  size?: 'default' | 'large' | 'small'
  className?: string
  children?: React.ReactNode
}) {
  const {
    color = 'default',
    round = false,
    size = 'default',
    className,
    children,
  } = props

  return (
    <span
      className={clsxMerge(
        tagClass({ color: color, round: round, size: size }),
        className,
      )}
    >
      {children}
    </span>
  )
}
