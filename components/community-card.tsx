import Link from 'next/link'

import { Authorized, Community } from '../src/schemas'
import Avatar from './basic/avatar'

export default function CommunityCard(props: {
  community: Authorized<Community> & { uri: string }
}) {
  const { community } = props

  return (
    <Link
      key={community.uri}
      href={`/${community.author.did}`}
      className="block w-60 rounded-md border shadow-sm hover:bg-gray-50"
    >
      <div className="flex items-center p-4">
        <div className="shrink-0">
          <Avatar
            size={12}
            name={community.name}
            value={community.extension?.avatar}
          />
        </div>
        <div className="px-4">
          <p className="truncate font-medium text-indigo-600">
            {community.name}
          </p>
          <p className="flex items-center text-sm text-gray-500">
            <span className="truncate">{community.author.did}</span>
          </p>
        </div>
      </div>
    </Link>
  )
}
