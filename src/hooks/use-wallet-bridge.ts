import type { Wallet } from 'wallet-bridge'
import { useIsomorphicLayoutEffect } from 'foxact/use-isomorphic-layout-effect'
import {
  useCallback,
  useState,
  useSyncExternalStore,
  useRef,
} from 'react'
import memo from 'lodash-es/memoize'
import { defaultResult } from '../utils/wallet-context'


const generateWalletState = memo(
  (
    hydrated: boolean,
    address?: string,
    coinType?: string,
    deviceAddress?: string
  ) => {
    return {
      hydrated,
      address,
      coinType,
      isConnected: address && coinType ? true : false,
      deviceAddress,
    }
  },
  (isHydrated, address, coinType, deviceAddress) =>
    `${isHydrated}-${address}-${coinType}-${deviceAddress}`
)

export const useWalletInstance = () => {
  const walletRef = useRef<Wallet | null>()
  const [isMounted, setIsMounted] = useState(false)
  useIsomorphicLayoutEffect(() => {
    import('../utils/wallet').then(({ wallet }) => {
      walletRef.current = wallet
      setIsMounted(true)
    })
    return () => setIsMounted(false)
  }, [])
  return [walletRef, isMounted] as const
}

export const useWalletBridgeAddress = () => {
  const [walletRef, isMounted] = useWalletInstance()
  const subscribe = useCallback(
    (cb: () => void) => {
      if (!isMounted) return () => { }
      walletRef.current?.walletSDK.context.addEventListener('walletConnect', cb)
      walletRef.current?.walletSDK.context.addEventListener(
        'walletDisconnect',
        cb
      )
      walletRef.current?.walletSDK.context.addEventListener('walletChange', cb)
      return () => {
        walletRef.current?.walletSDK.context.removeEventListener(
          'walletConnect',
          cb
        )
        walletRef.current?.walletSDK.context.removeEventListener(
          'walletDisconnect',
          cb
        )
        walletRef.current?.walletSDK.context.removeEventListener(
          'walletChange',
          cb
        )
      }
    },
    [isMounted, walletRef]
  )
  const getClientSnapShot = useCallback(() => {
    if (!isMounted) return defaultResult
    const {
      walletSnap: {
        address,
        coinType,
        deviceData: { ckbAddr } = { ckbAddr: undefined },
      },
    } = walletRef.current?.getWalletState() || { walletSnap: {} }
    return generateWalletState(isMounted, address, coinType, ckbAddr)
  }, [isMounted, walletRef])
  const getServerSnapShot = useCallback(() => defaultResult, [])
  return useSyncExternalStore(subscribe, getClientSnapShot, getServerSnapShot)
}