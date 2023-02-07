import dynamic from 'next/dynamic'
import '@rainbow-me/rainbowkit/styles.css'

import Button from './basic/button'
import useWallet from '../hooks/use-wallet'
import Link from 'next/link'
import Avatar from './basic/avatar'

const ConnectButtonCustom = dynamic(
  () =>
    import('@rainbow-me/rainbowkit').then(
      ({ ConnectButton }) => ConnectButton.Custom,
    ),
  { ssr: false },
)

export default function Toolbar() {
  const { account, avatar, name, displayAddress } = useWallet()

  return (
    <header className="flex h-18 w-full shrink-0 justify-center border-b px-4">
      <div className="flex h-18 max-w-5xl flex-1 items-center justify-between">
        <h1 className="text-xl">Voty</h1>
        <ConnectButtonCustom>
          {({ openConnectModal }) =>
            account ? (
              <Link href="/settings" className="group block shrink-0">
                <div className="flex items-center overflow-hidden">
                  <Avatar size={9} name={name} value={avatar} />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {name}
                    </p>
                    <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                      {displayAddress}
                    </p>
                  </div>
                </div>
              </Link>
            ) : (
              <Button primary onClick={openConnectModal}>
                Connect Wallet
              </Button>
            )
          }
        </ConnectButtonCustom>
      </div>
    </header>
  )
}
