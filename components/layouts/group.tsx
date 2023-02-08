import { ReactNode } from 'react'

import GroupNav from '../group-nav'

export default function GroupLayout(props: { children: ReactNode }) {
  return (
    <>
      <GroupNav className="fixed top-16 z-40 pt-4" />
      <main className="pt-24">{props.children}</main>
    </>
  )
}
