import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/20/solid'
import { BookmarkIcon as BookmarkOutlineIcon } from '@heroicons/react/24/outline'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect } from 'react'

import useAsync from '../hooks/use-async'
import useSignDocument from '../hooks/use-sign-document'
import useWallet from '../hooks/use-wallet'
import { currentDidAtom } from '../utils/atoms'
import { trpc } from '../utils/trpc'
import Notification from './basic/notification'
import TextButton from './basic/text-button'

export default function SubscriptionButton(props: {
  entry?: string
  className?: string
}) {
  const { account } = useWallet()
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
  const handleSubscribe = useAsync(
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
  const handleUnsubscribe = useAsync(
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

  return account ? (
    <>
      <Notification show={isError}>{error?.message}</Notification>
      <Notification show={handleUnsubscribe.status === 'error'}>
        {handleUnsubscribe.error?.message}
      </Notification>
      <Notification show={handleSubscribe.status === 'error'}>
        {handleSubscribe.error?.message}
      </Notification>
      {subscribed ? (
        <TextButton
          disabled={isLoading || handleUnsubscribe.status === 'pending'}
          onClick={handleUnsubscribe.execute}
          className={props.className}
        >
          <BookmarkSolidIcon className="h-5 w-5" />
        </TextButton>
      ) : (
        <TextButton
          disabled={isLoading || handleSubscribe.status === 'pending'}
          onClick={handleSubscribe.execute}
          className={props.className}
        >
          <BookmarkOutlineIcon className="h-5 w-5" />
        </TextButton>
      )}
    </>
  ) : null
}
