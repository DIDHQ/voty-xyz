import { ReactNode } from 'react'

import CommunityNav from '../community-nav'

export default function CommunityLayout(props: { children: ReactNode }) {
  return (
    <>
      <CommunityNav className="fixed top-16 mt-6" />
      <div className="pl-60">{props.children}</div>
    </>
  )
}
