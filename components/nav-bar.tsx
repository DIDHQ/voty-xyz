import { Navbar, Dropdown, Button } from 'react-daisyui'
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
    <Navbar className="shadow-md px-4">
      <div className="flex-1">
        <Link href="/">
          <Button className="text-xl normal-case no-underline" variant="link">
            Voty
          </Button>
        </Link>
      </div>
      <div className="flex-none gap-2">
        <ConnectButtonCustom>
          {({ account, openConnectModal }) => (
            <>
              <Dropdown vertical="end">
                <Button
                  color={account ? 'ghost' : 'primary'}
                  startIcon={
                    account ? (
                      <AvatarInput
                        size={32}
                        name={account.displayName}
                        value={account.ensAvatar}
                        disabled
                      />
                    ) : null
                  }
                  onClick={account ? undefined : openConnectModal}
                >
                  {account ? `${account.displayName}` : 'Connect Wallet'}
                </Button>
                <Dropdown.Menu className="w-52">
                  <Dropdown.Item
                    onClick={() => {
                      router.push('/settings')
                    }}
                  >
                    <Setting />
                    Settings
                  </Dropdown.Item>
                  {/* <Dropdown.Item>
                    <User />
                    View Profile
                  </Dropdown.Item> */}
                  <Dropdown.Item onClick={() => disconnect()}>
                    <Logout />
                    Log out
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </>
          )}
        </ConnectButtonCustom>
      </div>
    </Navbar>
  )
}
