import { Entry } from '@prisma/client'
import { Serialize } from '@trpc/server/dist/shared/internal/serialize'
import Link from 'next/link'

import { Authorized } from '../utils/schemas/authorship'
import { Community } from '../utils/schemas/community'
import Avatar from './basic/avatar'

export default function CommunityCard(props: {
  community: Authorized<Community> & Serialize<{ entry: Entry }>
}) {
  const { community } = props

  return (
    <Link
      key={community.entry.community}
      href={`/${community.authorship.author}`}
      className="block rounded-md border border-gray-200 hover:bg-gray-50"
    >
      <div className="flex items-center p-6">
        <div className="shrink-0">
          <Avatar
            size={20}
            name={community.authorship.author}
            value={community.extension?.avatar}
          />
        </div>
        <div className="px-4">
          <p className="truncate text-xl font-medium text-indigo-600">
            {community.name}
          </p>
          <p className="flex items-center text-lg text-gray-500">
            <span className="truncate">{community.authorship.author}</span>
          </p>
        </div>
      </div>
    </Link>
  )
}
