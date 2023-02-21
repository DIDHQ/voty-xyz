import Link from 'next/link'
import dynamic from 'next/dynamic'

import TextButton from './basic/text-button'
import { isTestnet } from '../utils/constants'

const ConnectButton = dynamic(() => import('./connect-button'), { ssr: false })

export default function Toolbar(props: { className?: string }) {
  return (
    <header className={props.className}>
      <div className="flex h-18 max-w-5xl flex-1 items-center justify-between px-6">
        <Link href="/">
          <TextButton>
            <h1 className="text-lg font-bold">
              VOTY{isTestnet ? ' TESTNET' : null}
            </h1>
          </TextButton>
        </Link>
        <ConnectButton />
      </div>
    </header>
  )
}
