import dynamic from 'next/dynamic'

import Slide from './basic/slide'
import TextButton from './basic/text-button'

const Article = dynamic(() => import('./basic/article'), { ssr: false })

export default function PreviewMarkdown(props: { children?: string }) {
  return (
    <Slide
      title="Preview markdown"
      trigger={({ handleOpen }) => (
        <TextButton onClick={handleOpen}>Preview markdown</TextButton>
      )}
    >
      {() => <Article>{props.children}</Article>}
    </Slide>
  )
}
