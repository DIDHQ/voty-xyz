import { ReactNode } from 'react'

import GroupNav from '../group-nav'

export default function GroupLayout(props: { children: ReactNode }) {
  return (
    <div className="pl-6">
      <GroupNav className="sticky top-16 z-40 pt-6" />
      <div className="pt-6">{props.children}</div>
    </div>
  )
}
