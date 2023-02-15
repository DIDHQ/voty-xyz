import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/20/solid'
import { BookmarkIcon as BookmarkOutlineIcon } from '@heroicons/react/24/outline'
import { useCallback, useEffect } from 'react'

import { trpc } from '../utils/trpc'
import Notification from './basic/notification'
import TextButton from './basic/text-button'

export default function SubscriptionButton(props: {
  entry?: string
  className?: string
}) {
  const {
    data: subscribed,
    refetch,
    isLoading,
  } = trpc.subscription.get.useQuery(props)
  const handleSet = trpc.subscription.set.useMutation()
  const handleSubscribe = useCallback(
    () => handleSet.mutate({ entry: props.entry, subscribe: true }),
    [handleSet, props.entry],
  )
  const handleUnsubscribe = useCallback(
    () => handleSet.mutate({ entry: props.entry, subscribe: false }),
    [handleSet, props.entry],
  )
  useEffect(() => {
    if (handleSet.isSuccess) {
      refetch()
    }
  }, [handleSet.isSuccess, refetch])

  return (
    <>
      <Notification show={handleSet.isError}>
        {handleSet.error?.message}
      </Notification>
      {subscribed ? (
        <TextButton
          disabled={isLoading || handleSet.isLoading}
          onClick={handleUnsubscribe}
          className={props.className}
        >
          <BookmarkSolidIcon className="h-5 w-5" />
        </TextButton>
      ) : (
        <TextButton
          disabled={isLoading || handleSet.isLoading}
          onClick={handleSubscribe}
          className={props.className}
        >
          <BookmarkOutlineIcon className="h-5 w-5" />
        </TextButton>
      )}
    </>
  )
}
