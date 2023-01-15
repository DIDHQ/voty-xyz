import { LinkIcon } from '@heroicons/react/20/solid'

export default function ArweaveLink(props: { id: string }) {
  return (
    <a href={`https://arweave.net/${props.id}`}>
      <LinkIcon />
    </a>
  )
}
