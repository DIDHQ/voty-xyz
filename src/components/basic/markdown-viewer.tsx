import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import TextLink from './text-link'
import OembedContainer from './oembed-container'

export default function MarkdownViewer(props: { children?: string }) {
  return props.children ? (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      sourcePos
      components={{
        a({ href, children }) {
          if (href) {
            return (
              <OembedContainer
                link={href}
                fallback={<TextLink href={href}>{children}</TextLink>}
              />
            )
          }
          return <>{children}</>
        },
      }}
    >
      {props.children}
    </ReactMarkdown>
  ) : null
}
