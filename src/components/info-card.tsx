import Link, { LinkProps } from "next/link"
import { clsxMerge } from "../utils/tailwind-helper"
import Thumbnail from "./basic/thumbnail"

export function InfoCard(props: LinkProps & {
  title?: string
  desc?: string
  thumbnail?: string
  className?: string
  badge?: React.ReactNode
  children?: React.ReactNode
}) {
  const {
    title,
    desc,
    thumbnail,
    className,
    badge,
    children,
    ...restProps
  } = props
  
  return (
    <Link
      className={clsxMerge(
        'group block overflow-hidden rounded-base bg-white shadow-base hover:ring-2 hover:ring-primary-500 transition',
        className
      )}
      shallow
      {...restProps}>
      <div 
        className="flex w-full gap-4 p-4 md:p-5">
        <div 
          className="min-w-0 flex-1">
          <div
            className="flex items-center gap-2">
            {badge}
              
            <h3
              className="truncate text-lg-semibold text-strong">
              {title}
            </h3>
          </div>
          
          <p 
            className="mt-2 line-clamp-3 text-sm-regular text-moderate">
            {desc}
          </p>
        </div>
        
        {thumbnail ? (
          <Thumbnail 
            src={thumbnail} />
        ) : null}
      </div>
      
      <div 
        className="flex gap-4 border-t border-base bg-base px-4 pb-4 pt-3 md:px-5">
        {children}
      </div>
    </Link>
  )
}

export function InfoItem(props: {
  label?: string
  value?: string | number
  hightlight?: boolean,
  phaseColor?: string
  className?: string
}) {
  const {
    label,
    value,
    hightlight = false,
    phaseColor,
    className
  } = props
  
  return (
    <div
      className={clsxMerge(
        'flex-1 min-w-0',
        className
      )}>
      <div
        className="text-sm font-semibold text-strong">
        {label}
      </div>
      
      <div
        className={clsxMerge(
          'text-sm',
          hightlight ? 'text-highlight font-bold' : 'font-medium text-subtle',
          phaseColor ? 'flex items-center gap-2' : ''
        )}>
        {phaseColor ? (
          <svg
            className={clsxMerge(
              'h-2 w-2',
              {
                'yellow': 'text-amber-400',
                'blue': 'text-sky-400',
                'purple': 'text-indigo-400',
                'green': 'text-primary-500',
                'gray': 'text-gray-400',
              }[phaseColor]
            )}
            fill="currentColor"
            viewBox="0 0 8 8">
            <circle cx={4} cy={4} r={3} />
          </svg>
        ) : null}
        
        {value}
      </div>
    </div>
  )
}
