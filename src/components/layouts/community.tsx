import { ReactNode } from 'react'

import CommunityNav from '../community-nav'

export default function CommunityLayout(props: { children: ReactNode }) {
  return (
    <>
      <div className="sticky top-18 shrink-0 pt-6">
        <CommunityNav className="relative w-60" />
      </div>
      <div className="flex-1">{props.children}</div>
    </>
  )
}
