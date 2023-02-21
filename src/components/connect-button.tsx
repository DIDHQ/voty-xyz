import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { useAtom } from 'jotai'
import { useEffect } from 'react'
import '@rainbow-me/rainbowkit/styles.css'

import useWallet from '../hooks/use-wallet'
import Button from './basic/button'
import Avatar from './basic/avatar'
import TextButton from './basic/text-button'
import useAvatar from '../hooks/use-avatar'
import { currentDidAtom } from '../utils/atoms'
import useDids from '../hooks/use-dids'
import { chainIdToCoinType } from '../utils/constants'

export default function ConnectButton() {
  const { account, displayAddress } = useWallet()
  const [currentDid, setCurrentDid] = useAtom(currentDidAtom)
  const { data: avatar } = useAvatar(currentDid)
  const { data: dids } = useDids(account)
  useEffect(() => {
    setCurrentDid((old) => old || dids?.[0] || '')
  }, [dids, setCurrentDid])

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
          <Link href="/settings">
            <TextButton className="flex items-center">
              <Avatar
                size={9}
                name={currentDid}
                value={avatar}
                variant="beam"
              />
              <div className="ml-3 hidden sm:block">
                {currentDid ? (
                  <p className="text-start text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {currentDid}
                  </p>
                ) : null}
                <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                  {displayAddress}
                </p>
              </div>
            </TextButton>
          </Link>
        ) : chain && chainIdToCoinType[chain.id] ? (
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
