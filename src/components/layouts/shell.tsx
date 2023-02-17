import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

import Sidebar from '../sidebar'

const Toolbar = dynamic(() => import('../toolbar'), {
  ssr: false,
  loading: () => (
    <header className="fixed top-0 z-40 flex h-16 w-full justify-center border-b border-gray-200 bg-white pl-24 pr-6" />
  ),
})

export default function ShellLayout(props: { children: ReactNode }) {
  return (
    <>
      <Sidebar />
      <Toolbar />
      <div className="flex w-full justify-center pl-18">
        <div className="mx-8 flex w-full max-w-5xl items-start py-18">
          {props.children}
        </div>
      </div>
    </>
  )
}
