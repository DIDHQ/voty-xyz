import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/20/solid'
import { BookmarkIcon as BookmarkOutlineIcon } from '@heroicons/react/24/outline'
import { useCallback, useEffect } from 'react'

import useSignDocument from '../hooks/use-sign-document'
import useWallet from '../hooks/use-wallet'
import { trpc } from '../utils/trpc'
import Notification from './basic/notification'
import TextButton from './basic/text-button'

export default function SubscriptionButton(props: {
  entry?: string
  className?: string
}) {
  const { name, account } = useWallet()
  const { refetch: refetchList } = trpc.subscription.list.useQuery(
    { subscriber: name },
    { enabled: !!name, refetchOnWindowFocus: false },
  )
  const { data, mutate, isLoading, isSuccess, isError, error } =
    trpc.subscription.set.useMutation()
  const { data: subscribed = data, refetch } = trpc.subscription.get.useQuery(
    { subscriber: name, entry: props.entry },
    { enabled: !!name && !!props.entry },
  )
  const handleSignDocument = useSignDocument(name)
  const handleSubscribe = useCallback(async () => {
    if (!props.entry) {
      return
    }
    const signed = await handleSignDocument({
      entry: props.entry,
      subscribe: true,
    })
    if (signed) {
      mutate(signed)
    }
  }, [handleSignDocument, mutate, props.entry])
  const handleUnsubscribe = useCallback(async () => {
    if (!props.entry) {
      return
    }
    const signed = await handleSignDocument({
      entry: props.entry,
      subscribe: false,
    })
    if (signed) {
      mutate(signed)
    }
  }, [handleSignDocument, mutate, props.entry])
  useEffect(() => {
    if (isSuccess) {
      refetch()
      refetchList()
    }
  }, [isSuccess, refetch, refetchList])

  return account ? (
    <>
      <Notification show={isError}>{error?.message}</Notification>
      {subscribed ? (
        <TextButton
          disabled={isLoading}
          onClick={handleUnsubscribe}
          className={props.className}
        >
          <BookmarkSolidIcon className="h-5 w-5" />
        </TextButton>
      ) : (
        <TextButton
          disabled={isLoading}
          onClick={handleSubscribe}
          className={props.className}
        >
          <BookmarkOutlineIcon className="h-5 w-5" />
        </TextButton>
      )}
    </>
  ) : null
}
