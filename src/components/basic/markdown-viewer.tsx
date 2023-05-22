import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'

export default function MarkdownViewer(props: { children?: string }) {
  return props.children ? (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        rehypeRaw,
        [
          rehypeSanitize,
          {
            ...defaultSchema,
            tagNames: [...(defaultSchema.tagNames || []), 'iframe'],
            attributes: {
              ...defaultSchema.attributes,
              iframe: ['src', 'frameborder', 'allow', 'title'],
            },
          },
        ],
      ]}
      sourcePos
    >
      {props.children}
    </ReactMarkdown>
  ) : null
}
