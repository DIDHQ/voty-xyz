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
  communityId?: string
  className?: string
}) {
  const { account } = useWallet()
  const { refetch: refetchList } = trpc.subscription.list.useQuery(
    { subscriber: { type: 'eth_personal_sign', address: account?.address! } },
    { enabled: !!account?.address },
  )
  const {
    data,
    mutateAsync,
    isLoading: isSetting,
    isError,
    error,
  } = trpc.subscription.set.useMutation({
    onSuccess() {
      refetch()
      refetchList()
    },
  })
  const {
    data: subscribed = data,
    refetch,
    isFetching,
  } = trpc.subscription.get.useQuery(
    {
      subscriber: { type: 'eth_personal_sign', address: account?.address! },
      communityId: props.communityId,
    },
    { enabled: !!account?.address && !!props.communityId },
  )
  const signSubscribe = useSignDocumentWithoutAuthorship(
    `You are subscribing community on Voty\n\nhash:\n{keccak256}`,
  )
  const signUnsubscribe = useSignDocumentWithoutAuthorship(
    `You are unsubscribing community on Voty\n\nhash:\n{keccak256}`,
  )
  const handleSubscribe = useMutation<
    void,
    Error,
    ReactMouseEvent<HTMLButtonElement, MouseEvent>
  >(async () => {
    if (!props.communityId) {
      return
    }
    const signed = await signSubscribe({
      communityId: props.communityId,
      subscribe: true,
    })
    await mutateAsync(signed)
  })
  const handleUnsubscribe = useMutation<
    void,
    Error,
    ReactMouseEvent<HTMLButtonElement, MouseEvent>
  >(async () => {
    if (!props.communityId) {
      return
    }
    const signed = await signUnsubscribe({
      communityId: props.communityId,
      subscribe: false,
    })
    await mutateAsync(signed)
  })

  return (
    <>
      <Notification type="error" show={isError}>
        {error?.message}
      </Notification>
      <Notification type="error" show={handleUnsubscribe.isError}>
        {handleUnsubscribe.error?.message}
      </Notification>
      <Notification type="error" show={handleSubscribe.isError}>
        {handleSubscribe.error?.message}
      </Notification>
      <Notification type="success" show={handleUnsubscribe.isSuccess}>
        Unsubscribed successfully
      </Notification>
      <Notification type="success" show={handleSubscribe.isSuccess}>
        Subscribed successfully
      </Notification>
      {subscribed ? (
        <TextButton
          primary
          disabled={isFetching || isSetting || handleUnsubscribe.isLoading}
          onClick={handleUnsubscribe.mutate}
          className={props.className}
        >
          <BookmarkSolidIcon className="h-5 w-5" />
        </TextButton>
      ) : (
        <TextButton
          primary
          disabled={isFetching || isSetting || handleSubscribe.isLoading}
          onClick={handleSubscribe.mutate}
          className={props.className}
        >
          <BookmarkOutlineIcon className="h-5 w-5" />
        </TextButton>
      )}
    </>
  )
}
