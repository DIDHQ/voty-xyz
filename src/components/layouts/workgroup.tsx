import { ReactNode } from 'react'

import WorkgroupNav from '../workgroup-nav'

export default function WorkgroupLayout(props: { children: ReactNode }) {
  return (
    <>
      <WorkgroupNav className="sticky top-0 z-20 -mx-6 px-6 pt-6 sm:top-18 sm:z-10 sm:pt-8" />
      {props.children}
    </>
  )
}
