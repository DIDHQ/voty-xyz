import { ReactNode } from 'react'

import Sidebar from './sidebar'
import Toolbar from './toolbar'

export default function Layout(props: { children: ReactNode }) {
  return (
    <main className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col items-center">
        <Toolbar />
        <div className="min-h-screen w-full overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl">{props.children}</div>
        </div>
      </div>
    </main>
  )
}
