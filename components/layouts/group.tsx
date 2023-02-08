import { ReactNode } from 'react'

import GroupNav from '../group-nav'

export default function GroupLayout(props: {
  hideNav: boolean
  children: ReactNode
}) {
  return (
    <>
      {props.hideNav ? null : <GroupNav className="sticky top-16 z-30 pt-6" />}
      {props.children}
    </>
  )
}
