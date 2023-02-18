import { ReactNode } from 'react'

import GroupNav from '../group-nav'

export default function GroupLayout(props: { children: ReactNode }) {
  return (
    <>
      <GroupNav className="sticky top-18 z-30 -mr-1 pr-1 pt-6 sm:pl-6" />
      {props.children}
    </>
  )
}
