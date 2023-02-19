import clsx from 'clsx'
import dynamic from 'next/dynamic'

const Markdown = dynamic(() => import('./markdown'), { ssr: false })

export default function Article(props: {
  small?: boolean
  children?: string
  className?: string
}) {
  return (
    <article
      className={clsx(
        'prose-sm prose-ol:list-decimal marker:prose-ol:text-gray-400 prose-ul:list-disc marker:prose-ul:text-gray-400',
        props.small ? 'sm:prose' : 'prose',
        props.className,
      )}
    >
      <Markdown>{props.children}</Markdown>
    </article>
  )
}
