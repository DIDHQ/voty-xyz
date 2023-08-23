import Link, { LinkProps } from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { clsxMerge } from "@/src/utils/tailwind-helper";

export function Back(props: LinkProps & {
  disabled?: boolean
  text?: string
  className?: string
}) {
  const {
    disabled = false,
    text = 'Back',
    className,
    ...restProps
  } = props
  
  return (
    <Link
      className={clsxMerge(
        'flex items-center gap-1 text-base font-medium text-moderate transition-colors',
        disabled ? 'cursor-not-allowed opacity-80' : 'hover:text-primary-500',
        className
      )}
      {...restProps}>
      <ChevronLeftIcon 
        className="h-4 w-4 stroke-2" />
      
      <span>
        {text}
      </span>
    </Link>
  )
}

export function BackBar (props: LinkProps & {
  disabled?: boolean
  className?: string
}) {
  return (
    <div
      className={clsxMerge(
        'flex mb-5',
        props.className
      )}>
      <Back 
        {...props}/>
    </div>
  )
}