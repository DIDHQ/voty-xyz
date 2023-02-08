import { ReactNode } from 'react'

import GroupNav from '../group-nav'

export default function GroupLayout(props: {
  isNew: boolean
  children: ReactNode
}) {
  return (
    <>
      {props.isNew ? null : <GroupNav className="sticky top-16 z-30 pt-6" />}
      {props.children}
    </>
  )
}
