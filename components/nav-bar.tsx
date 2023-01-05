import { Navbar, Dropdown, Button } from 'react-daisyui'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import ThemeSwitcher from './theme-switcher'

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
              VotyXYZ
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
              <Button color="primary" onClick={openConnectModal}>
                {account ? `${account.displayName}` : 'Connect Wallet'}
              </Button>
            )}
          </ConnectButtonCustom>
          <Dropdown vertical="end">
            <Button color="ghost" className="avatar" shape="circle">
              <div className="w-10 rounded-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://api.lorem.space/image/face?hash=33791"
                  alt="avatar"
                />
              </div>
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
        </div>
      </Navbar>
    </div>
  )
}

export default NavBar
