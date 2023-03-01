import { ReactNode } from 'react'

import CommunityNav from '../community-nav'

export default function CommunityLayout(props: { children: ReactNode }) {
  return (
    <>
      <div className="top-18 mt-[-1px] block w-full shrink-0 pt-6 sm:sticky sm:w-60 sm:pt-8">
        <CommunityNav />
      </div>
      <div className="w-full flex-1 sm:w-0 sm:pl-10">{props.children}</div>
    </>
  )
}
