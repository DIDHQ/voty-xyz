import { Menu, Transition } from '@headlessui/react'
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit'
import clsx from 'clsx'
import { Fragment, useCallback } from 'react'
import { Connector, useSignMessage } from 'wagmi'
import '@rainbow-me/rainbowkit/styles.css'

import useWallet from '../hooks/use-wallet'
import Button from './basic/button'
import Avatar from './basic/avatar'
import { requiredCoinTypeOfDidChecker } from '../utils/did'
import { getCurrentSnapshot } from '../utils/snapshot'
import { chainIdToCoinType, commonCoinTypes } from '../utils/constants'
import { snapshotAddressAccounts } from '../utils/das-database'
import { isTestnet } from '../utils/testnet'
import { Authorship } from '../utils/schemas/authorship'
import { signDocument } from '../utils/signature'
import { Auth } from '../utils/schemas/auth'

export default function ConnectButton() {
  const { signMessageAsync } = useSignMessage()
  const handleConnect = useCallback(
    async ({
      address,
      connector,
    }: {
      address?: `0x${string}`
      connector?: Connector
    }) => {
      if (!address || !connector) {
        return
      }
      const snapshot = await getCurrentSnapshot(commonCoinTypes.CKB)
      const dids = await snapshotAddressAccounts(
        chainIdToCoinType[await connector.getChainId()],
        address,
        snapshot,
      )
      const did = dids[0]
      if (!did) {
        return
      }
      const coinType = requiredCoinTypeOfDidChecker(did)
      const authorship = {
        author: did,
        coin_type: coinType,
        snapshot,
        testnet: isTestnet || undefined,
      } satisfies Authorship
      const document = { message: 'welcome to voty' } satisfies Auth
      const proof = await signDocument(
        { ...document, authorship },
        address,
        async (message) =>
          Buffer.from(
            (
              await signMessageAsync({
                message,
              })
            ).substring(2),
            'hex',
          ),
      )
      fetch(`/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...document, authorship, proof }),
      })
    },
    [signMessageAsync],
  )
  const handleDisconnect = useCallback(() => {}, [])
  const { account, avatar, name, displayAddress, disconnect } = useWallet(
    handleConnect,
    handleDisconnect,
  )

  return (
    <RainbowConnectButton.Custom>
      {({ openConnectModal, connectModalOpen }) =>
        account ? (
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="group flex shrink-0 items-center overflow-hidden">
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
              <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
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
          <Button primary loading={connectModalOpen} onClick={openConnectModal}>
            Connect Wallet
          </Button>
        )
      }
    </RainbowConnectButton.Custom>
  )
}
