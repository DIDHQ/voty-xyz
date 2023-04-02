import { ReactNode } from 'react'

import CommunityInfo from '../community-info'

export default function CommunityLayout(props: { children: ReactNode }) {
  return (
    <>
      <div className="block w-full shrink-0 sm:mt-8 sm:w-60">
        <CommunityInfo />
      </div>
      <div className="w-full flex-1 sm:w-0 sm:pl-10">{props.children}</div>
    </>
  )
}
