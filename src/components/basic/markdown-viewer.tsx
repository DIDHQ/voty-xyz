import ReactMarkdown, { Components } from 'react-markdown'
import { useMemo } from 'react'
import remarkGfm from 'remark-gfm'

import { isPermalink, permalink2Gateway } from '../../utils/permalink'
import TextLink from './text-link'
import OembedContainer from './oembed-container'

export default function MarkdownViewer(props: {
  preview?: boolean
  children?: string
}) {
  const components = useMemo(
    () =>
      ({
        img({ src, alt }) {
          return (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img
              src={
                src && isPermalink(src)
                  ? props.preview
                    ? `/api/upload-buffer?key=${encodeURIComponent(src)}`
                    : permalink2Gateway(src)
                  : src
              }
              alt={alt}
            />
          )
        },
        a({ href, children, title }) {
          if (href) {
            return (
              <OembedContainer
                link={href}
                fallback={
                  <TextLink href={href} secondary title={title}>
                    {children}
                  </TextLink>
                }
              />
            )
          }
          return <>{children}</>
        },
      }) satisfies Components,
    [props.preview],
  )

  return props.children ? (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      sourcePos
      components={components}
    >
      {props.children}
    </ReactMarkdown>
  ) : null
}
