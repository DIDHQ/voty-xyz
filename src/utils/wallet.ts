import {
  bsc,
  bscTestnet,
  goerli,
  mainnet as ethereum,
  polygon,
  polygonMumbai,
} from '@wagmi/core/chains'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import { configureChains, createConfig } from '@wagmi/core'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { CustomChain, Wallet } from 'wallet-bridge'
import { NEXT_PUBLIC_PROJECT_ID, NEXT_PUBLIC_TESTNET } from '../env/client'

const chainIdToRpc: { [chainId: number]: string | undefined } = {
  [ethereum.id]: 'https://eth.public-rpc.com',
  [goerli.id]: 'https://rpc.ankr.com/eth_goerli',
  [bsc.id]: 'https://bscrpc.com',
  [bscTestnet.id]: 'https://rpc.ankr.com/bsc_testnet_chapel',
  [polygon.id]: 'https://polygon-rpc.com',
  [polygonMumbai.id]: 'https://rpc.ankr.com/polygon_mumbai',
}

const { chains, publicClient } = configureChains(
  [ethereum, goerli, bsc, bscTestnet, polygon, polygonMumbai],
  [
    jsonRpcProvider({
      rpc(chain) {
        return { http: chainIdToRpc[chain.id] || '' }
      },
    }),
  ],
)

const connector = new WalletConnectConnector({
  chains,
  options: {
    projectId: NEXT_PUBLIC_PROJECT_ID,
    metadata: {
      name: 'Voty',
      description: 'Voty',
      url: 'https://voty.xyz',
      icons: ['https://voty.xyz/icon.svg'],
    },
    showQrModal: true,
  },
})

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [connector],
  publicClient,
})

const wallet = new Wallet({
  isTestNet: !!NEXT_PUBLIC_TESTNET,
  loggedInSelectAddress: true,
  customChains: [
    CustomChain.torus,
    CustomChain.eth,
    CustomChain.bsc,
    CustomChain.polygon,
    CustomChain.tron,
    CustomChain.passkey,
  ],
  wagmiConfig,
})

export { wallet }
