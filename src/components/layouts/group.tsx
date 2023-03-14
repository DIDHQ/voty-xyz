import { ReactNode } from 'react'

import GroupNav from '../group-nav'

export default function GroupLayout(props: { children: ReactNode }) {
  return (
    <>
      <GroupNav className="z-20 -mx-6 px-6 pt-6 sm:pt-8" />
      {props.children}
    </>
  )
}
