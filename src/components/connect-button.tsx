import { ConnectButton as RainbowKitConnectButton } from '@rainbow-me/rainbowkit'
import { Menu } from '@headlessui/react'
import { clsx } from 'clsx'
import { event } from 'nextjs-google-analytics'
import { useEffect, useMemo } from 'react'
import '@rainbow-me/rainbowkit/styles.css'

import { PowerIcon } from '@heroicons/react/20/solid'
import { ArrowsRightLeftIcon, WalletIcon } from '@heroicons/react/24/outline'
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
  const query = useRouterQuery<['communityId']>()
  const isManager = useIsManager(query.communityId)
  const { data: dids } = useDids(account)
  const isMember = useMemo(
    () =>
      !!dids?.find(
        (did) => !!query.communityId && did.startsWith(query.communityId),
      ),
    [dids, query.communityId],
  )
  useEffect(() => {
    if (account && query.communityId) {
      event('connect_wallet', {
        address: account.address,
        coinType: account.coinType,
        communityId: query.communityId,
        isManager,
        isMember,
      })
    }
  }, [account, isManager, isMember, query.communityId])

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
                    className="h-8 w-8 sm:h-9 sm:w-9"
                  />
                ) : (
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9" variant="beam" />
                )}

                <div className="group ml-2 hidden text-left sm:block">
                  <p className="text-sm-medium text-moderate transition-colors group-hover:text-strong">
                    {coinTypeNames[account.coinType]}
                  </p>

                  <p className="text-xs-medium text-subtle transition-colors group-hover:text-moderate">
                    {displayAddress}
                  </p>
                </div>
              </>
            }
          >
            <div>
              <Menu.Item>
                {({ active }) => (
                  <div
                    className={clsx(
                      'flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm-medium transition',
                      active
                        ? 'bg-primary-500/5 text-primary-500'
                        : 'text-moderate',
                    )}
                    onClick={disconnect}
                  >
                    <PowerIcon className="h-5 w-5" />

                    <span>Disconnect</span>
                  </div>
                )}
              </Menu.Item>
            </div>
          </Dropdown>
        ) : chain?.unsupported ? (
          <>
            <Button
              className="hidden sm:flex"
              loading={chainModalOpen}
              onClick={openChainModal}
            >
              Switch Network
            </Button>

            <Button
              className="flex sm:hidden"
              icon={ArrowsRightLeftIcon}
              loading={chainModalOpen}
              size="small"
              onClick={openChainModal}
            ></Button>
          </>
        ) : (
          <>
            <Button
              className="hidden sm:flex"
              loading={connectModalOpen}
              onClick={openConnectModal}
            >
              Connect Wallet
            </Button>

            <Button
              className="flex sm:hidden"
              icon={WalletIcon}
              loading={connectModalOpen}
              size="small"
              onClick={openConnectModal}
            ></Button>
          </>
        )
      }
    </RainbowKitConnectButton.Custom>
  )
}
