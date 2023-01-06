import { Navbar, Dropdown, Button } from 'react-daisyui'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Logout, User, UserToUserTransmission } from '@icon-park/react'

import ThemeSwitcher from './theme-switcher'
import AvatarInput from './avatar-input'

const ConnectButtonCustom = dynamic(
  () =>
    import('@rainbow-me/rainbowkit').then(
      ({ ConnectButton }) => ConnectButton.Custom,
    ),
  { ssr: false },
)

export default function NavBar() {
  return (
    <Navbar className="shadow-md px-4">
      <div className="flex-1">
        <Link href="/">
          <Button className="text-xl normal-case" color="ghost">
            Voty
          </Button>
        </Link>
      </div>
      <div className="flex-none gap-2">
        <ThemeSwitcher />
        <ConnectButtonCustom>
          {({ account, openConnectModal }) => (
            <>
              <Dropdown vertical="end">
                <Button
                  color="ghost"
                  startIcon={
                    <AvatarInput
                      size={32}
                      name={account?.displayName}
                      value={account?.ensAvatar}
                      disabled
                    />
                  }
                  onClick={openConnectModal}
                >
                  {account ? `${account.displayName}` : 'Connect Wallet'}
                </Button>
                <Dropdown.Menu className="w-52">
                  <Dropdown.Item>
                    <User />
                    View Profile
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <UserToUserTransmission />
                    Delegate
                  </Dropdown.Item>
                  <Dropdown.Item>
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
