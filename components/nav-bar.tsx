import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Logout, Setting } from '@icon-park/react'
import { useRouter } from 'next/router'

import AvatarInput from './avatar-input'
import useWallet from '../hooks/use-wallet'

const ConnectButtonCustom = dynamic(
  () =>
    import('@rainbow-me/rainbowkit').then(
      ({ ConnectButton }) => ConnectButton.Custom,
    ),
  { ssr: false },
)

export default function NavBar() {
  const { disconnect } = useWallet()
  const router = useRouter()

  return (
    <div className="shadow-md px-4">
      <div className="flex-1">
        <Link href="/">Voty</Link>
      </div>
      <div className="flex-none gap-2">
        <ConnectButtonCustom>
          {({ account, openConnectModal }) => (
            <>
              <div>
                {account ? (
                  <AvatarInput
                    size={32}
                    name={account.displayName}
                    value={account.ensAvatar}
                    disabled
                  />
                ) : null}
                <button onClick={account ? undefined : openConnectModal}>
                  {account ? `${account.displayName}` : 'Connect Wallet'}
                </button>

                <ul className="w-52">
                  <li
                    onClick={() => {
                      router.push('/settings')
                    }}
                  >
                    <Setting />
                    Settings
                  </li>
                  <li onClick={() => disconnect()}>
                    <Logout />
                    Log out
                  </li>
                </ul>
              </div>
            </>
          )}
        </ConnectButtonCustom>
      </div>
    </div>
  )
}
