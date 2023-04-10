import { ConnectKitButton } from 'connectkit'
import { Menu } from '@headlessui/react'
import clsx from 'clsx'

import useWallet from '../hooks/use-wallet'
import Button from './basic/button'
import Avatar from './basic/avatar'
import { coinTypeLogos, coinTypeNames } from '../utils/constants'
import Dropdown from './basic/dropdown'

export default function ConnectButton() {
  const { account, displayAddress, disconnect } = useWallet()

  return (
    <ConnectKitButton.Custom>
      {({ show, chain, isConnecting }) =>
        account ? (
          <Dropdown
            trigger={
              <>
                {coinTypeLogos[account.coinType] ? (
                  <img
                    src={coinTypeLogos[account.coinType]}
                    alt="logo"
                    className="h-9 w-9"
                  />
                ) : (
                  <Avatar size={9} variant="beam" />
                )}
                <div className="group ml-2 hidden text-start sm:block">
                  <p className="text-start text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {coinTypeNames[account.coinType]}
                  </p>
                  <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                    {displayAddress}
                  </p>
                </div>
              </>
            }
          >
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={disconnect}
                    className={clsx(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block w-full px-4 py-2 text-start text-sm',
                    )}
                  >
                    Disconnect
                  </button>
                )}
              </Menu.Item>
            </div>
          </Dropdown>
        ) : (
          <Button primary loading={isConnecting} onClick={show}>
            {chain?.unsupported ? 'Switch Network' : 'Connect Wallet'}
          </Button>
        )
      }
    </ConnectKitButton.Custom>
  )
}
