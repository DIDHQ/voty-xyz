import { LinkTwo } from '@icon-park/react'
import { Button } from 'react-daisyui'

export default function ArweaveLink(props: { id: string }) {
  return (
    <a href={`https://arweave.net/${props.id}`}>
      <Button variant="link">
        <LinkTwo />
      </Button>
    </a>
  )
}
