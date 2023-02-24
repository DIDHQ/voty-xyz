import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/20/solid'
import { BookmarkIcon as BookmarkOutlineIcon } from '@heroicons/react/24/outline'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect } from 'react'

import useAsync from '../hooks/use-async'
import useSignDocument from '../hooks/use-sign-document'
import { currentDidAtom } from '../utils/atoms'
import { trpc } from '../utils/trpc'
import Notification from './basic/notification'
import TextButton from './basic/text-button'

export default function SubscriptionButton(props: {
  entry?: string
  className?: string
}) {
  const currentDid = useAtomValue(currentDidAtom)
  const { refetch: refetchList } = trpc.subscription.list.useQuery(
    { subscriber: currentDid },
    { enabled: !!currentDid, refetchOnWindowFocus: false },
  )
  const { data, mutate, isLoading, isSuccess, isError, error } =
    trpc.subscription.set.useMutation()
  const { data: subscribed = data, refetch } = trpc.subscription.get.useQuery(
    { subscriber: currentDid, entry: props.entry },
    { enabled: !!currentDid && !!props.entry, refetchOnWindowFocus: false },
  )
  const handleSignDocument = useSignDocument(currentDid)
  const handleSignSubscribe = useAsync(
    useCallback(async () => {
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
    }, [handleSignDocument, mutate, props.entry]),
  )
  const handleSignUnsubscribe = useAsync(
    useCallback(async () => {
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
    }, [handleSignDocument, mutate, props.entry]),
  )
  useEffect(() => {
    if (isSuccess) {
      refetch()
      refetchList()
    }
  }, [isSuccess, refetch, refetchList])

  return currentDid ? (
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
  ) : null
}
