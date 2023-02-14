import { ExoticComponent, ReactNode, useCallback, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

import useSignDocument from '../../hooks/use-sign-document'
import useStatus from '../../hooks/use-status'
import { getPeriod, Period } from '../../utils/duration'
import { Group, Vote } from '../../utils/schemas'
import { trpc } from '../../utils/trpc'
import Button from '../basic/button'
import Notification from '../basic/notification'

export default function SigningVoteButton(props: {
  did: string
  proposal?: string
  duration: Group['duration']
  icon?: ExoticComponent<{ className?: string }>
  onSuccess: (permalink: string) => void
  disabled?: boolean
  children: ReactNode
  className?: string
}) {
  const { onSuccess } = props
  const { handleSubmit: onSubmit } = useFormContext<Vote>()
  const handleSignDocument = useSignDocument<Vote>(props.did)
  const handleCreate = trpc.vote.create.useMutation()
  const handleClick = useCallback(
    async (vote: Vote) => {
      const signed = await handleSignDocument(vote)
      if (signed) {
        return handleCreate.mutate(signed)
      }
    },
    [handleSignDocument, handleCreate],
  )
  const { data: status } = useStatus(props.proposal)
  useEffect(() => {
    if (handleCreate.isSuccess) {
      onSuccess(handleCreate.data)
    }
  }, [handleCreate.data, handleCreate.isSuccess, onSuccess])

  return (
    <>
      <Notification show={handleCreate.isError}>
        {handleCreate.error?.message}
      </Notification>
      <Button
        primary
        icon={props.icon}
        onClick={onSubmit(handleClick, console.error)}
        disabled={
          props.disabled ||
          !status?.timestamp ||
          getPeriod(Date.now() / 1000, status?.timestamp, props.duration) !==
            Period.VOTING
        }
        loading={handleCreate.isLoading}
        className={props.className}
      >
        {props.children}
      </Button>
    </>
  )
}
