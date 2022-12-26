import { Alignment, Button, Navbar } from '@blueprintjs/core'
import { ReactNode } from 'react'
import useWallet from '../hooks/use-wallet'

export default function Layout(props: { children: ReactNode }) {
  const wallet = useWallet()

  return (
    <>
      <Navbar>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>VOTY</Navbar.Heading>
          <Navbar.Divider />
          <Button minimal icon="home" text="Home" />
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          <Button
            minimal
            icon="bank-account"
            text={
              wallet.address
                ? `${wallet.address.substring(
                    0,
                    5,
                  )}...${wallet.address.substring(38)}`
                : 'Connect Wallet'
            }
          />
        </Navbar.Group>
      </Navbar>
      <main>{props.children}</main>
    </>
  )
}
