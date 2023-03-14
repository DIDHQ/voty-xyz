import dynamic from 'next/dynamic'

import Markdown from './basic/markdown'
import TextButton from './basic/text-button'

const Article = dynamic(() => import('./basic/article'), { ssr: false })

const Slide = dynamic(() => import('./basic/slide'), { ssr: false })

export default function PreviewMarkdown(props: { children?: string }) {
  return (
    <Slide
      title="Preview markdown"
      trigger={({ handleOpen }) => (
        <TextButton secondary onClick={handleOpen}>
          Preview markdown
        </TextButton>
      )}
    >
      {() => (
        <Article>
          <Markdown>{props.children}</Markdown>
        </Article>
      )}
    </Slide>
  )
}
