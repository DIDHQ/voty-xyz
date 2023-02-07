import { ReactNode } from 'react'

import Sidebar from './sidebar'
import Toolbar from './toolbar'

export default function Layout(props: { children: ReactNode }) {
  return (
    <>
      <Sidebar />
      <Toolbar />
      <div className="mx-auto w-full p-18 pl-36">
        <div className="mx-auto w-full max-w-5xl">{props.children}</div>
      </div>
    </>
  )
}
