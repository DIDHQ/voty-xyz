import { Authorized, Community } from '../src/schemas'
import Avatar from './basic/avatar'

export default function CommunityAside(props: {
  community: Authorized<Community>
}) {
  const { community } = props

  return (
    <aside className="rounded-md border">
      <Avatar
        name={community.author.did}
        value={community.extension?.avatar}
        size={20}
      />
    </aside>
  )
}
