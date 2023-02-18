import { ReactNode } from 'react'

import WorkgroupNav from '../workgroup-nav'

export default function WorkgroupLayout(props: { children: ReactNode }) {
  return (
    <>
      <WorkgroupNav className="sticky top-18 z-30 -mr-1 pr-1 pt-6 sm:pl-6" />
      {props.children}
    </>
  )
}
