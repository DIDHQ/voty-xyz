import { useWalletInfo, useWalletMethod } from '../utils/wallet-context'

export default function useWallet() {
  const {
    hydrated: isMounted,
    address,
    coinType,
    isConnected,
    deviceAddress,
  } = useWalletInfo()
  const { connect, sign: signMessageAsync, loggedInfo } = useWalletMethod()
  return {
    account:
      isMounted && coinType && address
        ? { coinType, address, deviceAddress }
        : undefined,
    displayAddress:
      isMounted && coinType && address
        ? `${address.slice(0, 5)}...${address.slice(-4)}`
        : undefined,
    signMessage: async (message: string) => {
      if (coinType) {
        return btoa((await signMessageAsync(message)) || '')
      }
      throw new Error(`sign message unsupported coin type: ${coinType}`)
    },
    connect: () => (isConnected ? null : connect()),
    disconnect: () => loggedInfo(),
  }
}
