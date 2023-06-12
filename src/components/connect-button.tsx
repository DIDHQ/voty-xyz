import { ConnectButton as RainbowKitConnectButton } from '@rainbow-me/rainbowkit'
import { Menu } from '@headlessui/react'
import { clsx } from 'clsx'
import { event } from 'nextjs-google-analytics'
import { useEffect, useMemo } from 'react'
import '@rainbow-me/rainbowkit/styles.css'

import useWallet from '../hooks/use-wallet'
import { coinTypeLogos, coinTypeNames } from '../utils/constants'
import useRouterQuery from '../hooks/use-router-query'
import useIsManager from '../hooks/use-is-manager'
import useDids from '../hooks/use-dids'
import Button from './basic/button'
import Avatar from './basic/avatar'
import Dropdown from './basic/dropdown'

export default function ConnectButton() {
  const { account, displayAddress, disconnect } = useWallet()
  const query = useRouterQuery<['community_id']>()
  const isManager = useIsManager(query.community_id)
  const { data: dids } = useDids(account)
  const isMember = useMemo(
    () =>
      !!dids?.find(
        (did) => !!query.community_id && did.startsWith(query.community_id),
      ),
    [dids, query.community_id],
  )
  useEffect(() => {
    if (account && query.community_id) {
      event('connect_wallet', {
        address: account.address,
        coinType: account.coinType,
        communityId: query.community_id,
        isManager,
        isMember,
      })
    }
  }, [account, isManager, isMember, query.community_id])

  return (
    <RainbowKitConnectButton.Custom>
      {({
        chain,
        connectModalOpen,
        openConnectModal,
        chainModalOpen,
        openChainModal,
      }) =>
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
        ) : chain?.unsupported ? (
          <Button primary loading={chainModalOpen} onClick={openChainModal}>
            Switch Network
          </Button>
        ) : (
          <Button primary loading={connectModalOpen} onClick={openConnectModal}>
            Connect Wallet
          </Button>
        )
      }
    </RainbowKitConnectButton.Custom>
  )
}
