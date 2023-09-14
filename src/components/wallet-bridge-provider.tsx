import { useMemo } from 'react'
import { useWalletBridgeAddress, useWalletInstance } from '../hooks/use-wallet-bridge'
import { WalletInfoContext, WalletMethodInfo } from '../utils/wallet-context'

const WalletInfoProvider = ({ children }: { children: React.ReactNode }) => {
  const value = useWalletBridgeAddress()
  return (
    <WalletInfoContext.Provider value={value}>
      {children}
    </WalletInfoContext.Provider>
  )
}


const WalletMethodProvider = ({ children }: { children: React.ReactNode }) => {
  const [walletRef, isMounted] = useWalletInstance()
  const value = useMemo(() => {
    const connect = () => {
      if (!isMounted) return
      walletRef.current?.connectWallet()
    }
    const disconnect = () => {
      if (!isMounted) return
      walletRef.current?.walletSDK.disconnect()
    }
    const loggedInfo = () => {
      if (!isMounted) return
      walletRef.current?.loggedInfo()
    }
    const signMessage = async (message: string) => {
      if (!isMounted) throw new Error('wallet not mounted')
      const { signData } = await walletRef.current!.initSignContext()
      const sign = await signData(message)
      if (!sign) throw new Error('sign failed')
      return sign
    }
    return {
      connect,
      disconnect,
      loggedInfo,
      sign: signMessage,
    }
  }, [walletRef, isMounted])
  return (
    <WalletMethodInfo.Provider value={value}>
      {children}
    </WalletMethodInfo.Provider>
  )
}

const WalletBridgeProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <WalletInfoProvider>
      <WalletMethodProvider>{children}</WalletMethodProvider>
    </WalletInfoProvider>
  )
}

export default WalletBridgeProvider