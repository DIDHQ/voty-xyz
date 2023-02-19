import { ReactNode } from 'react'

import Sidebar from '../sidebar'
import Toolbar from '../toolbar'

export default function ShellLayout(props: { children: ReactNode }) {
  return (
    <>
      <Toolbar
        className={
          'fixed top-0 z-40 flex h-18 w-full justify-center border-b border-gray-200 bg-white/80 backdrop-blur sm:pl-18'
        }
      />
      <Sidebar />
      <div className="flex w-full justify-center sm:pl-18">
        <div className="flex w-full max-w-5xl flex-col items-start px-6 py-18 sm:flex-row">
          {props.children}
        </div>
      </div>
    </>
  )
}
