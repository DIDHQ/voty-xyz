import { Alignment, Button, Navbar } from '@blueprintjs/core'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ReactNode } from 'react'

export default function Layout(props: { children: ReactNode }) {
  return (
    <>
      <Navbar>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>VOTY</Navbar.Heading>
          <Navbar.Divider />
          <Button minimal icon="home" text="Home" />
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          <ConnectButton.Custom>
            {({ account, openConnectModal }) => (
              <Button
                minimal
                icon="bank-account"
                text={
                  account
                    ? `${account.address.substring(
                        0,
                        5,
                      )}...${account.address.substring(38)}`
                    : 'Connect Wallet'
                }
                onClick={openConnectModal}
              />
            )}
          </ConnectButton.Custom>
        </Navbar.Group>
      </Navbar>
      <main>{props.children}</main>
    </>
  )
}
