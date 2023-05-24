import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { isPermalink, permalink2Gateway } from '../../utils/permalink'
import TextLink from './text-link'
import OembedContainer from './oembed-container'

export default function MarkdownViewer(props: {
  preview?: boolean
  children?: string
}) {
  return props.children ? (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      sourcePos
      components={{
        img({ src, ...restProps }) {
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
              {...restProps}
            />
          )
        },
        a({ href, children, ...restProps }) {
          if (href) {
            return (
              <OembedContainer
                link={href}
                fallback={
                  <TextLink href={href} secondary {...restProps}>
                    {children}
                  </TextLink>
                }
              />
            )
          }
          return <a {...restProps} />
        },
      }}
    >
      {props.children}
    </ReactMarkdown>
  ) : null
}
