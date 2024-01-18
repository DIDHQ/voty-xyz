import { event } from 'nextjs-google-analytics'
import { useEffect, useMemo } from 'react'
import { WalletIcon } from '@heroicons/react/24/outline'
import useWallet from '../hooks/use-wallet'
import { coinTypeLogos, coinTypeNames } from '../utils/constants'
import useRouterQuery from '../hooks/use-router-query'
import useIsManager from '../hooks/use-is-manager'
import useDids from '../hooks/use-dids'
import Button from './basic/button'
import Avatar from './basic/avatar'

export default function ConnectButton() {
  const { account, displayAddress, disconnect, connect } = useWallet()
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
    <>
      {account ? (
        <button className="flex items-center" onClick={disconnect}>
          {coinTypeLogos[parseInt(account.coinType, 10)] ? (
            <img
              src={coinTypeLogos[parseInt(account.coinType, 10)]}
              alt="logo"
              className="h-8 w-8 sm:h-9 sm:w-9"
            />
          ) : (
            <Avatar className="h-8 w-8 sm:h-9 sm:w-9" variant="beam" />
          )}
          <div className="group ml-2 hidden text-left sm:block">
            <p className="text-sm-medium text-moderate transition-colors group-hover:text-strong">
              {coinTypeNames[parseInt(account.coinType, 10)]}
            </p>
            <p className="text-xs-medium text-subtle transition-colors group-hover:text-moderate">
              {displayAddress}
            </p>
          </div>
        </button>
      ) : (
        <>
          <Button className="hidden sm:flex" onClick={connect}>
            Connect Wallet
          </Button>
          <Button
            className="flex sm:hidden"
            icon={WalletIcon}
            size="small"
            onClick={connect}
          ></Button>
        </>
      )}
    </>
  )
}
