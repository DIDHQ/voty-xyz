import { tv } from "tailwind-variants"
import { clsxMerge } from "@/src/utils/tailwind-helper"

const cardClass = tv({
  base: 'mb-4 overflow-hidden rounded-base bg-white px-4 shadow-base md:mb-6',
  variants: {
    size: {
      default: 'py-5 md:px-5',
      large: 'py-8 md:px-8 md:py-10',
      medium: 'py-8 md:px-5 md:py-10'
    }
  }
})

export default function Card(props: {
  size?: 'default' | 'large' | 'medium'
  subtitle?: string
  title?: string
  className?: string
  children?: React.ReactNode
}) {
  const {
    size = 'default',
    subtitle,
    title,
    className,
    children
  } = props
  
  return (
    <div
      className={clsxMerge(
        cardClass({ size: size }),
        className
      )}>
      {title ? (
        <div
          className="mb-4">
          <h3
            className="text-lg-semibold text-strong">
            {title}
          </h3>
          
          {subtitle ? (
            <p
              className="mt-1 text-sm-regular text-subtle">
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : null}
        
      {children}
    </div>
  )
}