import { ReactNode } from 'react'

import PreviewBar from '../preview-bar'
import ToolBar from '../tool-bar'

export default function ShellLayout(props: { children: ReactNode }) {
  return (
    <>
      <ToolBar />
      <div className="flex w-full justify-center pb-safe">
        <div className="flex w-full max-w-5xl flex-col items-start px-6 pb-24 sm:flex-row">
          {props.children}
        </div>
      </div>
      <PreviewBar />
    </>
  )
}
