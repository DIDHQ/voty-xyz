import { ReactNode } from 'react'

import GroupInfo from '../group-info'

export default function GroupLayout(props: { children: ReactNode }) {
  return (
    <>
      <GroupInfo className="z-20 -mx-6 px-6 pt-6 sm:pt-8" />
      {props.children}
    </>
  )
}
