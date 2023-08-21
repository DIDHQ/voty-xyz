import { clsxMerge } from "@/src/utils/tailwind-helper"

export function Container(props: {
  hasSidebar?: boolean
  size?: 'default' | 'small'
  className?: string
  children?: React.ReactNode
}) {
  const {
    hasSidebar = false,
    size = 'default',
    className,
    children
  } = props
  
  return (
    <div 
      className={clsxMerge(
        'mx-auto w-full',
        size === 'small' ? 'max-w-3xl' : 'max-w-5xl',
        className
      )}>
      {hasSidebar ? (
        <div
          className="flex flex-col gap-4 sm:flex-row md:gap-6 lg:gap-8">
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  )
}

export function Main (props: {
  className?: string
  children?: React.ReactNode
}) {
  const {
    className,
    children
  } = props
  
  return (
    <div
      className={clsxMerge(
        'sm:min-w-0 sm:flex-1',
        className
      )}>
      {children}
    </div>
  )
}

export function Sidebar (props: {
  className?: string
  children?: React.ReactNode
}) {
  const {
    className,
    children
  } = props
  
  return (
    <aside
      className={clsxMerge(
        'shrink-0 sm:w-64 md:w-72 lg:w-80',
        className
      )}>
      {children}
    </aside>
  )
}

