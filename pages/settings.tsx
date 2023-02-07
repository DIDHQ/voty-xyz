import { useRouter } from 'next/router'
import { useCallback } from 'react'

import Button from '../components/basic/button'
import useWallet from '../hooks/use-wallet'

export default function SettingsPage() {
  const { disconnect } = useWallet()
  const router = useRouter()
  const handleDisconnect = useCallback(() => {
    disconnect()
    router.push('/')
  }, [disconnect, router])

  return (
    <main className="flex-1 overflow-hidden py-8">
      <Button key="1" onClick={handleDisconnect}>
        Disconnect
      </Button>
    </main>
  )
}
