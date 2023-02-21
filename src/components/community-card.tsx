import {
  BookmarkIcon,
  HandRaisedIcon,
  UserGroupIcon,
} from '@heroicons/react/20/solid'
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
      className="block border border-gray-200 p-4 focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 hover:border-gray-400 hover:bg-gray-50"
    >
      <div className="flex items-start">
        <Avatar
          size={20}
          name={community.authorship.author}
          value={community.extension?.avatar}
        />
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">
            {community.name}
          </h3>
          <p className="flex items-center text-gray-500">
            <span className="truncate">{community.authorship.author}</span>
          </p>
        </div>
      </div>
      <div className="mt-4 flex justify-between space-x-2 pr-10 text-sm text-gray-500">
        <div className="flex flex-1 items-center">
          <UserGroupIcon className="mr-2 h-4 w-4" />
          {community.workgroups?.length || 0}
        </div>
        <div className="flex flex-1 items-center">
          <HandRaisedIcon className="mr-2 h-4 w-4" />
          {community.entry.proposals}
        </div>
        <div className="flex flex-1 items-center">
          <BookmarkIcon className="mr-2 h-4 w-4" />
          {community.entry.subscribers}
        </div>
      </div>
    </Link>
  )
}
