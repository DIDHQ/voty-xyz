import { Navbar, Dropdown, Button } from 'react-daisyui'
import Link from 'next/link'
import dynamic from 'next/dynamic'

import ThemeSwitcher from './theme-switcher'
import AvatarInput from './avatar-input'

type NavBarProps = {}

const ConnectButtonCustom = dynamic(
  () =>
    import('@rainbow-me/rainbowkit').then(
      ({ ConnectButton }) => ConnectButton.Custom,
    ),
  { ssr: false },
)

function NavBar(props: NavBarProps) {
  return (
    <div className="flex w-full component-preview p-4 items-center justify-center gap-2 font-sans">
      <Navbar className="bg-base-200 shadow-xl rounded-box">
        <div className="flex-1">
          <Link href="/">
            <Button className="text-xl normal-case" color="ghost">
              Voty
            </Button>
          </Link>
        </div>
        <div className="flex-none gap-3">
          <ThemeSwitcher />
          <Link href="/create">
            <Button color="primary">Create an Organization</Button>
          </Link>
          <ConnectButtonCustom>
            {({ account, openConnectModal }) => (
              <>
                <Dropdown vertical="end">
                  <Button
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
                    <li>
                      <a className="justify-between">
                        Profile
                        <span className="badge">New</span>
                      </a>
                    </li>
                    <Dropdown.Item>Settings</Dropdown.Item>
                    <Dropdown.Item>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            )}
          </ConnectButtonCustom>
        </div>
      </Navbar>
    </div>
  )
}

export default NavBar
