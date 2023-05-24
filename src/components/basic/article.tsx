import { clsx } from 'clsx'
import { ReactNode } from 'react'

export default function Article(props: {
  small?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <article
      className={clsx(
        'max-w-none break-words prose-ol:list-decimal marker:prose-ol:text-gray-400 prose-ul:list-disc marker:prose-ul:text-gray-400',
        props.small ? 'prose-sm' : 'prose',
        props.className,
      )}
    >
      {props.children}
    </article>
  )
}
