import { ReactNode } from 'react'

import Sidebar from '../sidebar'
import Toolbar from '../toolbar'

export default function ShellLayout(props: { children: ReactNode }) {
  return (
    <>
      <Sidebar className="fixed left-0 top-0 z-20 hidden h-screen w-18 flex-col items-center border-r border-gray-200 bg-white sm:flex" />
      <Toolbar
        className={
          'sticky top-0 z-20 flex h-18 w-full justify-center border-b border-gray-200 bg-white/80 backdrop-blur'
        }
      />
      <div className="flex w-full justify-center sm:pl-18">
        <div className="flex w-full max-w-5xl flex-col items-start px-6 pb-10 sm:flex-row">
          {props.children}
        </div>
      </div>
    </>
  )
}
