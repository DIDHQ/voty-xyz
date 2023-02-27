import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/20/solid'
import { BookmarkIcon as BookmarkOutlineIcon } from '@heroicons/react/24/outline'
import { useCallback, useEffect } from 'react'

import useAsync from '../hooks/use-async'
import useSignDocumentWithoutAuthorship from '../hooks/use-sign-document-without-authorship'
import useWallet from '../hooks/use-wallet'
import { trpc } from '../utils/trpc'
import Notification from './basic/notification'
import TextButton from './basic/text-button'

export default function SubscriptionButton(props: {
  entry?: string
  className?: string
}) {
  const { account } = useWallet()
  const { refetch: refetchList } = trpc.subscription.list.useQuery(
    { subscriber: { type: 'eth_personal_sign', address: account?.address! } },
    { enabled: !!account?.address, refetchOnWindowFocus: false },
  )
  const { data, mutate, isLoading, isSuccess, isError, error } =
    trpc.subscription.set.useMutation()
  const { data: subscribed = data, refetch } = trpc.subscription.get.useQuery(
    {
      subscriber: { type: 'eth_personal_sign', address: account?.address! },
      entry: props.entry,
    },
    {
      enabled: !!account?.address && !!props.entry,
      refetchOnWindowFocus: false,
    },
  )
  const signSubscribe = useSignDocumentWithoutAuthorship(
    `You are subscribing community of Voty\n\nhash:\n{sha256}`,
  )
  const signUnsubscribe = useSignDocumentWithoutAuthorship(
    `You are unsubscribing community of Voty\n\nhash:\n{sha256}`,
  )
  const handleSignSubscribe = useAsync(
    useCallback(async () => {
      if (!props.entry) {
        return
      }
      const signed = await signSubscribe({
        entry: props.entry,
        subscribe: true,
      })
      if (signed) {
        mutate(signed)
      }
    }, [signSubscribe, mutate, props.entry]),
  )
  const handleSignUnsubscribe = useAsync(
    useCallback(async () => {
      if (!props.entry) {
        return
      }
      const signed = await signUnsubscribe({
        entry: props.entry,
        subscribe: false,
      })
      if (signed) {
        mutate(signed)
      }
    }, [signUnsubscribe, mutate, props.entry]),
  )
  useEffect(() => {
    if (isSuccess) {
      refetch()
      refetchList()
    }
  }, [isSuccess, refetch, refetchList])

  return (
    <>
      <Notification show={isError}>{error?.message}</Notification>
      <Notification show={handleSignUnsubscribe.status === 'error'}>
        {handleSignUnsubscribe.error?.message}
      </Notification>
      <Notification show={handleSignSubscribe.status === 'error'}>
        {handleSignSubscribe.error?.message}
      </Notification>
      {subscribed ? (
        <TextButton
          disabled={isLoading || handleSignUnsubscribe.status === 'pending'}
          onClick={handleSignUnsubscribe.execute}
          className={props.className}
        >
          <BookmarkSolidIcon className="h-5 w-5" />
        </TextButton>
      ) : (
        <TextButton
          disabled={isLoading || handleSignSubscribe.status === 'pending'}
          onClick={handleSignSubscribe.execute}
          className={props.className}
        >
          <BookmarkOutlineIcon className="h-5 w-5" />
        </TextButton>
      )}
    </>
  )
}
