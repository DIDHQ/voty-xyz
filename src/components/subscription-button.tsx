import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/20/solid'
import { BookmarkIcon as BookmarkOutlineIcon } from '@heroicons/react/24/outline'
import { useMutation } from '@tanstack/react-query'
import { MouseEvent as ReactMouseEvent, useEffect } from 'react'

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
  const { data, mutateAsync, isLoading, isSuccess, isError, error } =
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
  const handleSignSubscribe = useMutation<
    void,
    Error,
    ReactMouseEvent<HTMLButtonElement, MouseEvent>
  >(async () => {
    if (!props.entry) {
      return
    }
    const signed = await signSubscribe({
      entry: props.entry,
      subscribe: true,
    })
    if (signed) {
      await mutateAsync(signed)
    }
  })
  const handleSignUnsubscribe = useMutation<
    void,
    Error,
    ReactMouseEvent<HTMLButtonElement, MouseEvent>
  >(async () => {
    if (!props.entry) {
      return
    }
    const signed = await signUnsubscribe({
      entry: props.entry,
      subscribe: false,
    })
    if (signed) {
      await mutateAsync(signed)
    }
  })
  useEffect(() => {
    if (isSuccess) {
      refetch()
      refetchList()
    }
  }, [isSuccess, refetch, refetchList])

  return (
    <>
      <Notification show={isError}>{error?.message}</Notification>
      <Notification show={handleSignUnsubscribe.isError}>
        {handleSignUnsubscribe.error?.message}
      </Notification>
      <Notification show={handleSignSubscribe.isError}>
        {handleSignSubscribe.error?.message}
      </Notification>
      {subscribed ? (
        <TextButton
          primary
          disabled={isLoading || handleSignUnsubscribe.isLoading}
          onClick={handleSignUnsubscribe.mutate}
          className={props.className}
        >
          <BookmarkSolidIcon className="h-5 w-5" />
        </TextButton>
      ) : (
        <TextButton
          primary
          disabled={isLoading || handleSignSubscribe.isLoading}
          onClick={handleSignSubscribe.mutate}
          className={props.className}
        >
          <BookmarkOutlineIcon className="h-5 w-5" />
        </TextButton>
      )}
    </>
  )
}
