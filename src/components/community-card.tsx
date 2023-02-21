import {
  BookmarkIcon,
  HandRaisedIcon,
  BriefcaseIcon,
} from '@heroicons/react/20/solid'
import { Entry } from '@prisma/client'
import { Serialize } from '@trpc/server/dist/shared/internal/serialize'
import Link from 'next/link'

import { Authorized } from '../utils/schemas/authorship'
import { Community } from '../utils/schemas/community'
import Avatar from './basic/avatar'
import { Grid6 } from './basic/grid'

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
      <div className="flex items-center">
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
      <Grid6 className="mt-4 text-sm text-gray-500">
        <div className="col-span-2 flex items-center">
          <BriefcaseIcon className="mr-2 h-4 w-4" />
          {community.workgroups?.length || 0}
        </div>
        <div className="col-span-2 flex items-center">
          <HandRaisedIcon className="mr-2 h-4 w-4" />
          {community.entry.proposals}
        </div>
        <div className="col-span-2 flex items-center">
          <BookmarkIcon className="mr-2 h-4 w-4" />
          {community.entry.subscribers}
        </div>
      </Grid6>
    </Link>
  )
}
