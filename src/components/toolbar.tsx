import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

import Button from './basic/button'
import useWallet from '../hooks/use-wallet'
import Avatar from './basic/avatar'
import TextButton from './basic/text-button'
import { isTestnet } from '../utils/testnet'

export default function Toolbar(props: { className?: string }) {
  const { account, avatar, name: did, displayAddress } = useWallet()

  return (
    <header className={props.className}>
      <div className="mx-8 flex h-18 max-w-5xl flex-1 items-center justify-between">
        <Link href="/">
          <TextButton>
            <h1 className="text-lg font-bold">
              VOTY{isTestnet ? ' TESTNET' : null}
            </h1>
          </TextButton>
        </Link>
        <ConnectButton.Custom>
          {({ openConnectModal, connectModalOpen }) =>
            account ? (
              <Link href="/settings" className="group block shrink-0">
                <div className="flex items-center overflow-hidden">
                  <Avatar
                    size={9}
                    name={did || account.address}
                    value={avatar}
                    variant="beam"
                  />
                  <div className="ml-3 hidden sm:block">
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
