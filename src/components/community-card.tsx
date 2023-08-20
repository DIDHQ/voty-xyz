import Link from 'next/link'

import { Community } from '../utils/schemas/v1/community'
import useCommunityLogo from '../hooks/use-community-logo'
import Avatar from './basic/avatar'

export default function CommunityCard(props: {
  community: Omit<Community, 'logo' | 'links' | 'about'> & { permalink: string }
}) {
  const { community } = props
  const { data: logo } = useCommunityLogo(community.permalink)

  return (
    <Link
      className="flex h-28 items-center rounded-base bg-white p-4 shadow-base transition hover:ring-2 hover:ring-primary-500 md:h-32 md:p-5"
      href={`/${community.id}`}
      title={community.name}>
      <Avatar 
        className="ring-offset-2"
        size={15} 
        value={logo} />
        
      <div 
        className="ml-4 min-w-0 flex-1">
        <h3 
          className="truncate break-words text-lg-semibold text-strong">
          {community.name}
        </h3>
        
        <p 
          className="mt-0.5 line-clamp-2 text-sm-regular text-moderate">
          {community.slogan}
        </p>
      </div>
    </Link>
  )
}
