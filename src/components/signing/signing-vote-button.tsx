import { ExoticComponent, ReactNode, useCallback, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

import useSignDocument from '../../hooks/use-sign-document'
import { Vote } from '../../utils/schemas'
import { trpc } from '../../utils/trpc'
import Button from '../basic/button'
import Notification from '../basic/notification'

export default function SigningVoteButton(props: {
  did: string
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
      if (!signed) {
        throw new Error('signing failed')
      }
      return handleCreate.mutate(signed)
    },
    [handleSignDocument, handleCreate],
  )
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
        disabled={props.disabled}
        loading={handleCreate.isLoading}
        className={props.className}
      >
        {props.children}
      </Button>
    </>
  )
}
