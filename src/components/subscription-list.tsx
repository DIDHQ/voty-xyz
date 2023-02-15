import { useEffect } from 'react'

import useSignDocument from '../hooks/use-sign-document'
import useWallet from '../hooks/use-wallet'
import {
  Authorization,
  authorizationMessage,
  setAuthorization,
  setAuthorizationCurrent,
} from '../utils/authorization'
import { trpc } from '../utils/trpc'

export default function SubscriptionList(props: { className?: string }) {
  const { did } = useWallet()
  const { error } = trpc.subscription.list.useQuery({ subscriber: did })
  const handleSignDocument = useSignDocument<Authorization>(0, did)
  useEffect(() => {
    if (did) {
      setAuthorizationCurrent(did)
    }
  }, [did])
  useEffect(() => {
    if (error?.data?.code === 'UNAUTHORIZED') {
      handleSignDocument({ message: authorizationMessage }).then((signed) => {
        if (signed) {
          setAuthorization(signed)
        }
      })
    }
  }, [error?.data?.code, handleSignDocument])

  return <div className={props.className} />
}
