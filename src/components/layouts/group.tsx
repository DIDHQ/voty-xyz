import { ReactNode } from 'react'

import GroupInfo from '../group-info'

export default function GroupLayout(props: { children: ReactNode }) {
  return (
    <>
      <GroupInfo className="pt-6 sm:pt-8" />
      {props.children}
    </>
  )
}
