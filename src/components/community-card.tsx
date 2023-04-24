import Link from 'next/link'

import { Community } from '../utils/schemas/community'
import Avatar from './basic/avatar'

export default function CommunityCard(props: { community: Community }) {
  const { community } = props

  return (
    <Link
      href={`/${community.id}`}
      className="flex items-center overflow-hidden rounded-md border border-gray-200 p-6 transition-colors focus-within:ring-2 focus-within:ring-primary-300 focus-within:ring-offset-2 hover:border-primary-500 hover:bg-gray-50"
    >
      <Avatar size={24} value={community.extension.logo} className="shrink-0" />
      <div className="ml-4 flex h-24 w-0 flex-1 flex-col">
        <h3 className="w-full truncate break-words text-lg font-medium text-gray-900">
          {community.name}
        </h3>
        <p className="line-clamp-3 w-full text-sm text-gray-500">
          {community.extension.slogan}
        </p>
      </div>
    </Link>
  )
}
