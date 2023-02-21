import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import '@rainbow-me/rainbowkit/styles.css'

import useWallet from '../hooks/use-wallet'
import Button from './basic/button'
import Avatar from './basic/avatar'
import TextButton from './basic/text-button'

export default function ConnectButton() {
  const { account, avatar, name, displayAddress } = useWallet()

  return (
    <RainbowConnectButton.Custom>
      {({ openConnectModal, connectModalOpen }) =>
        account ? (
          <Link href="/settings">
            <TextButton className="flex items-center">
              <Avatar
                size={9}
                name={name || account.address}
                value={avatar}
                variant="beam"
              />
              <div className="ml-3 hidden sm:block">
                <p className="text-start text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {name}
                </p>
                <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                  {displayAddress}
                </p>
              </div>
            </TextButton>
          </Link>
        ) : (
          <Button primary loading={connectModalOpen} onClick={openConnectModal}>
            Connect Wallet
          </Button>
        )
      }
    </RainbowConnectButton.Custom>
  )
}
