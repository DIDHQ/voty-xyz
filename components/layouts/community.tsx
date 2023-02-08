import { ReactNode } from 'react'

import CommunityAside from '../community-aside'

export default function CommunityLayout(props: { children: ReactNode }) {
  return (
    <>
      <CommunityAside className="fixed top-20" />
      <main className="pl-64 pt-4">{props.children}</main>
    </>
  )
}
