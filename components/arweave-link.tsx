import { LinkTwo } from '@icon-park/react'

export default function ArweaveLink(props: { id: string }) {
  return (
    <a href={`https://arweave.net/${props.id}`}>
      <LinkTwo />
    </a>
  )
}
