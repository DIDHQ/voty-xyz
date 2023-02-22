import { ReactNode } from 'react'

import WorkgroupNav from '../workgroup-nav'

export default function WorkgroupLayout(props: { children: ReactNode }) {
  return (
    <>
      <WorkgroupNav className="sticky top-0 z-30 -mx-6 px-6 pt-6 sm:top-18 sm:-mr-1 sm:ml-0 sm:pr-1 sm:pl-6" />
      {props.children}
    </>
  )
}
