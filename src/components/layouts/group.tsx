import { ReactNode } from 'react'

import GroupNav from '../group-nav'

export default function GroupLayout(props: { children: ReactNode }) {
  return (
    <>
      <GroupNav className="sticky top-18 z-30 -mr-1 pt-6 pl-6 pr-1" />
      {props.children}
    </>
  )
}
