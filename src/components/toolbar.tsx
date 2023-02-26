import Link from 'next/link'
import dynamic from 'next/dynamic'

import TextButton from './basic/text-button'
import { isTestnet, documentTitle } from '../utils/constants'

const ConnectButton = dynamic(() => import('./connect-button'), { ssr: false })

export default function Toolbar(props: { className?: string }) {
  return (
    <header className={props.className}>
      <Link
        href="/"
        className="hidden h-18 w-18 shrink-0 cursor-pointer items-center justify-center border-r border-gray-200 sm:flex"
      >
        <img
          src="https://tailwindui.com/img/logos/mark.svg?color=green&shade=600"
          alt="LOGO"
          className="h-8 w-auto"
        />
      </Link>
      <div className="flex-1">
        <div className="mx-auto flex h-18 max-w-5xl items-center justify-between px-6">
          <TextButton href="/">
            <h1 className="text-lg font-bold">
              {documentTitle}
              {isTestnet ? ' TESTNET' : null}
            </h1>
          </TextButton>
          <ConnectButton />
        </div>
      </div>
    </header>
  )
}
