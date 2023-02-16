import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/20/solid'
import { BookmarkIcon as BookmarkOutlineIcon } from '@heroicons/react/24/outline'
import { useCallback, useEffect } from 'react'

import useWallet from '../hooks/use-wallet'
import { trpc } from '../utils/trpc'
import Notification from './basic/notification'
import TextButton from './basic/text-button'

export default function SubscriptionButton(props: {
  entry?: string
  className?: string
}) {
  const { account } = useWallet()
  const { refetch: refetchList } = trpc.subscription.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: false,
  })
  const { data, mutate, isLoading, isSuccess, isError, error } =
    trpc.subscription.set.useMutation()
  const handleSubscribe = useCallback(
    () => mutate({ entry: props.entry, subscribe: true }),
    [mutate, props.entry],
  )
  const handleUnsubscribe = useCallback(
    () => mutate({ entry: props.entry, subscribe: false }),
    [mutate, props.entry],
  )
  useEffect(() => {
    if (isSuccess) {
      refetchList()
    }
  }, [isSuccess, refetchList])
  useEffect(() => {
    mutate({ entry: props.entry })
  }, [mutate, props.entry])

  return account ? (
    <>
      <Notification show={isError}>{error?.message}</Notification>
      {data ? (
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
