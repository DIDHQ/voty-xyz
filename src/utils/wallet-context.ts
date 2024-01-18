import { createContext, useContext } from 'react'

export const defaultResult: {
  hydrated: boolean
  address?: string
  coinType?: string
  isConnected: boolean
  deviceAddress?: string
} = {
  hydrated: false,
  isConnected: false,
}

export const WalletInfoContext = createContext(defaultResult)
export const WalletMethodInfo = createContext<{
  connect: () => void
  disconnect: () => void
  loggedInfo: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sign: (
    data: string,
    options?: Record<string, unknown> | undefined,
  ) => Promise<string>
}>({
  connect: () => {},
  disconnect: () => {},
  loggedInfo: () => {},
  sign: () => Promise.resolve(''),
})

export const useWalletInfo = () => {
  return useContext(WalletInfoContext)
}

export const useWalletMethod = () => {
  return useContext(WalletMethodInfo)
}
