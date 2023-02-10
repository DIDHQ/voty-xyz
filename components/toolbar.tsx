import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

import Button from './basic/button'
import useWallet from '../hooks/use-wallet'
import Avatar from './basic/avatar'
import TextButton from './basic/text-button'

export default function Toolbar() {
  const { account, avatar, did, displayAddress } = useWallet()

  return (
    <header className="fixed top-0 z-40 flex h-16 w-full justify-center border-b border-gray-200 bg-white pl-24 pr-6">
      <div className="flex h-16 max-w-5xl flex-1 items-center justify-between">
        <Link href="/">
          <TextButton>
            <h1 className="text-lg font-bold">VOTY</h1>
          </TextButton>
        </Link>
        <ConnectButton.Custom>
          {({ openConnectModal, connectModalOpen }) =>
            account ? (
              <Link href="/settings" className="group block shrink-0">
                <div className="flex items-center overflow-hidden">
                  <Avatar size={9} name={did} value={avatar} />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {did}
                    </p>
                    <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                      {displayAddress}
                    </p>
                  </div>
                </div>
              </Link>
            ) : (
              <Button
                primary
                loading={connectModalOpen}
                onClick={openConnectModal}
              >
                Connect Wallet
              </Button>
            )
          }
        </ConnectButton.Custom>
      </div>
    </header>
  )
}
