import { ReactNode } from 'react'

import Sidebar from './sidebar'

export default function Layout(props: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen">
      <Sidebar />
      {props.children}
    </main>
  )
}
