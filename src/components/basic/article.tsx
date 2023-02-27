import clsx from 'clsx'

import Markdown from './markdown'

export default function Article(props: {
  small?: boolean
  children?: string
  className?: string
}) {
  return props.children ? (
    <article
      className={clsx(
        'max-w-none prose-ol:list-decimal marker:prose-ol:text-gray-400 prose-ul:list-disc marker:prose-ul:text-gray-400',
        props.small ? 'prose-sm' : 'prose',
        props.className,
      )}
    >
      <Markdown>{props.children}</Markdown>
    </article>
  ) : null
}
