import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/20/solid'
import { BookmarkIcon as BookmarkOutlineIcon } from '@heroicons/react/24/outline'
import { useEffect } from 'react'

import { trpc } from '../utils/trpc'
import Notification from './basic/notification'
import TextButton from './basic/text-button'

export default function SubscriptionButton(props: {
  entry?: string
  className?: string
}) {
  const { data: subscribed, refetch } = trpc.subscription.get.useQuery(props)
  const handleSubscribe = trpc.subscription.subscribe.useMutation()
  const handleUnsubscribe = trpc.subscription.unsubscribe.useMutation()
  useEffect(() => {
    if (handleSubscribe.isSuccess) {
      refetch()
    }
  }, [handleSubscribe.isSuccess, refetch])
  useEffect(() => {
    if (handleUnsubscribe.isSuccess) {
      refetch()
    }
  }, [handleUnsubscribe.isSuccess, refetch])

  return (
    <>
      <Notification show={handleSubscribe.isError}>
        {handleSubscribe.error?.message}
      </Notification>
      <Notification show={handleUnsubscribe.isError}>
        {handleUnsubscribe.error?.message}
      </Notification>
      {subscribed ? (
        <TextButton
          disabled={handleUnsubscribe.isLoading}
          onClick={() => handleUnsubscribe.mutate({ entry: props.entry })}
          className={props.className}
        >
          <BookmarkSolidIcon className="h-5 w-5" />
        </TextButton>
      ) : (
        <TextButton
          disabled={handleSubscribe.isLoading}
          onClick={() => handleSubscribe.mutate({ entry: props.entry })}
          className={props.className}
        >
          <BookmarkOutlineIcon className="h-5 w-5" />
        </TextButton>
      )}
    </>
  )
}
