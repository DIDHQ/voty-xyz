import Link from 'next/link'
import dynamic from 'next/dynamic'
import { css } from '@emotion/css'
import '@rainbow-me/rainbowkit/styles.css'

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

  return (
    <div
      className={css`
        display: flex;
        justify-content: space-between;
        align-items: center;
      `}
    >
      <Link
        href="/"
        className={css`
          text-decoration: none;
        `}
      >
        <h1>Voty</h1>
      </Link>
      <ConnectButtonCustom>
        {({ account, openConnectModal }) => (
          <button onClick={account ? disconnect : openConnectModal}>
            {account ? `${account.displayName}` : 'Connect Wallet'}
          </button>
        )}
      </ConnectButtonCustom>
    </div>
  )
}
