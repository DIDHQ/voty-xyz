import { ReactNode } from 'react'

import CommunityNav from '../community-nav'

export default function CommunityLayout(props: { children: ReactNode }) {
  return (
    <>
      <div className="top-18 block w-full shrink-0 pt-6 sm:sticky sm:w-60">
        <CommunityNav className="relative" />
      </div>
      <div className="w-full flex-1">{props.children}</div>
    </>
  )
}
