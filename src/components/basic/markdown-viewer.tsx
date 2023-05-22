import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

export default function MarkdownViewer(props: { children?: string }) {
  return props.children ? (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      sourcePos
    >
      {props.children}
    </ReactMarkdown>
  ) : null
}
