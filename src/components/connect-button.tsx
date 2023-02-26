import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

import useWallet from '../hooks/use-wallet'
import Button from './basic/button'
import Avatar from './basic/avatar'
import TextButton from './basic/text-button'
import { chainIdToCoinType, coinTypeNames } from '../utils/constants'

export default function ConnectButton() {
  const { account, displayAddress } = useWallet()

  return (
    <RainbowConnectButton.Custom>
      {({
        openConnectModal,
        openChainModal,
        connectModalOpen,
        chainModalOpen,
        chain,
      }) =>
        account ? (
          <TextButton href="/settings" className="flex items-center">
            <Avatar size={9} name={account.address} variant="beam" />
            <div className="ml-2 hidden text-start sm:block">
              <p className="text-start text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {coinTypeNames[account.coinType]}
              </p>
              <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                {displayAddress}
              </p>
            </div>
          </TextButton>
        ) : !chain || chainIdToCoinType[chain.id] ? (
          <Button primary loading={connectModalOpen} onClick={openConnectModal}>
            Connect Wallet
          </Button>
        ) : (
          <Button primary loading={chainModalOpen} onClick={openChainModal}>
            Switch Network
          </Button>
        )
      }
    </RainbowConnectButton.Custom>
  )
}
