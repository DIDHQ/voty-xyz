import { useInView } from 'react-intersection-observer'
import { clsxMerge } from "@/src/utils/tailwind-helper"

interface Header {
  label: string
  className?: string
}

export function Table(props: {
  headers: Header[]
  className?: string
  children?: React.ReactNode
}) {
  const {
    headers,
    className,
    children
  } = props
  
  const { ref: inViewRef } = useInView()
  
  return (
    <table
      className={clsxMerge(
        'w-full border-spacing-0 table-fixed',
        className
      )}>
      <thead>
        <tr>
          {headers?.map((item, index) => (
            <th
              className={clsxMerge(
                'px-4 py-3 text-left text-xs font-semibold text-moderate',
                item.className
              )}
              key={index}>
              {item.label}
            </th>
          ))}
        </tr>
      </thead>
      
      <tbody>
        {children}
      </tbody>
      
      <tfoot 
        ref={inViewRef} />
    </table>
  )
}

export function TableRow(props: {
  className?: string
  children?: React.ReactNode
}) {
  const {
    className,
    children
  } = props
  
  return (
    <tr
      className={clsxMerge(
        'odd:bg-subtle rounded-lg overflow-hidden',
        className
      )}>
      {children}
    </tr>
  )
}

export function TableCell(props: {
  title?: string
  className?: string
  children?: React.ReactNode
}) {
  const {
    title,
    className,
    children
  } = props
  
  return (
    <td
      className={clsxMerge(
        'text-sm text-moderate truncate whitespace-nowrap px-3 py-3 first:rounded-l-lg first:text-strong last:rounded-r-lg sm:px-4',
        className
      )}
      title={title}>
      {children}
    </td>
  )
}