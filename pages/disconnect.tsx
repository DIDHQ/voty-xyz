import { useRouter } from 'next/router'
import { useEffect } from 'react'

import useWallet from '../hooks/use-wallet'

export default function DisconnectPage() {
  const router = useRouter()
  const { disconnect } = useWallet()
  useEffect(() => {
    disconnect()
    router.back()
  }, [disconnect, router])

  return null
}
