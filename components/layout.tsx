import dynamic from 'next/dynamic'
import { ReactNode } from 'react'
import { Button } from 'react-daisyui'

const ConnectButtonCustom = dynamic(
  () =>
    import('@rainbow-me/rainbowkit').then(
      ({ ConnectButton }) => ConnectButton.Custom,
    ),
  { ssr: false },
)

export default function Layout(props: { children: ReactNode }) {
  return (
    <>
      <ConnectButtonCustom>
        {({ account, openConnectModal }) => (
          <Button onClick={openConnectModal}>
            {account
              ? `${account.address.substring(
                  0,
                  5,
                )}...${account.address.substring(38)}`
              : 'Connect Wallet'}
          </Button>
        )}
      </ConnectButtonCustom>
      <main>{props.children}</main>
    </>
  )
}
