import { ReactNode } from 'react'

import Sidebar from '../sidebar'
import Toolbar from '../toolbar'

export default function ShellLayout(props: { children: ReactNode }) {
  return (
    <>
      <Sidebar />
      <Toolbar />
      <div className="mx-auto w-full p-16 pl-32">
        <div className="mx-auto w-full max-w-5xl">{props.children}</div>
      </div>
    </>
  )
}
