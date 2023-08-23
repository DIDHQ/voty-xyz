import { ReactNode } from 'react'

import GroupInfo from '../group-info'

export default function GroupLayout(props: { children: ReactNode }) {
  return (
    <>
      <GroupInfo />
        
      {props.children}
    </>
  )
}
