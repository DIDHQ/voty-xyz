import { clsxMerge } from '@/src/utils/tailwind-helper'

export default function SectionHeader(props: {
  title?: string
  className?: string
  children?: React.ReactNode
}) {
  const { title, className, children } = props

  return (
    <div
      className={clsxMerge(
        'mb-4 flex flex-col items-start md:mb-5 min-[356px]:flex-row min-[356px]:items-center',
        title ? 'justify-between gap-3 min-[356px]:gap-4' : 'justify-end',
        className,
      )}
    >
      {title ? <h2 className="text-xl-semibold text-strong">{title}</h2> : null}

      {children}
    </div>
  )
}
