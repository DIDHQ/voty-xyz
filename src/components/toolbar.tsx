import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import clsx from 'clsx'
import '@rainbow-me/rainbowkit/styles.css'

import Button from './basic/button'
import useWallet from '../hooks/use-wallet'
import Avatar from './basic/avatar'
import TextButton from './basic/text-button'
import { isTestnet } from '../utils/testnet'

export default function Toolbar(props: { className?: string }) {
  const { account, avatar, name: did, displayAddress, disconnect } = useWallet()

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
        <ConnectButton.Custom>
          {({ openConnectModal, connectModalOpen }) =>
            account ? (
              <Menu as="div" className="relative inline-block text-left">
                <Menu.Button className="group flex shrink-0 items-center overflow-hidden">
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
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={disconnect}
                            className={clsx(
                              active
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-700',
                              'block w-full px-4 py-2 text-left text-sm',
                            )}
                          >
                            Disconnect
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
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
