import { ReactNode } from 'react'

import GroupNav from '../group-nav'

export default function GroupLayout(props: { children: ReactNode }) {
  return (
    <div>
      <GroupNav className="fixed top-20" />
      <main className="pt-24">{props.children}</main>
    </div>
  )
}
