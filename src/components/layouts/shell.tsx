import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

import Sidebar from '../sidebar'

const toolbarClassName =
  'fixed top-0 z-40 flex h-18 w-full justify-center border-b border-gray-200 bg-white/80 sm:pl-18 backdrop-blur'

const Toolbar = dynamic(() => import('../toolbar'), {
  ssr: false,
  loading: () => <header className={toolbarClassName} />,
})

export default function ShellLayout(props: { children: ReactNode }) {
  return (
    <>
      <Toolbar className={toolbarClassName} />
      <Sidebar />
      <div className="flex w-full justify-center sm:pl-18">
        <div className="mx-6 flex w-full max-w-5xl flex-col items-start py-18 sm:flex-row">
          {props.children}
        </div>
      </div>
    </>
  )
}
