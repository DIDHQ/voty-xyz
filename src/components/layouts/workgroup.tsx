import { ReactNode } from 'react'

import WorkgroupNav from '../workgroup-nav'

export default function WorkgroupLayout(props: { children: ReactNode }) {
  return (
    <>
      <WorkgroupNav className="z-20 -mx-6 px-6 pt-6 sm:pt-8" />
      {props.children}
    </>
  )
}
