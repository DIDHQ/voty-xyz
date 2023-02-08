import { ReactNode } from 'react'

import CommunityNav from '../community-nav'

export default function CommunityLayout(props: { children: ReactNode }) {
  return (
    <>
      <CommunityNav className="fixed top-20" />
      <main className="pl-64 pt-4">{props.children}</main>
    </>
  )
}
