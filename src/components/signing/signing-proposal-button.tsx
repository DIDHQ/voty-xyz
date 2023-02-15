import { ExoticComponent, ReactNode, useCallback, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

import useSignDocument from '../../hooks/use-sign-document'
import { Proposal } from '../../utils/schemas'
import { trpc } from '../../utils/trpc'
import Button from '../basic/button'
import Notification from '../basic/notification'

export default function SigningProposalButton(props: {
  did: string
  icon?: ExoticComponent<{ className?: string }>
  onSuccess: (permalink: string) => void
  disabled?: boolean
  children: ReactNode
  className?: string
}) {
  const { onSuccess } = props
  const { handleSubmit: onSubmit } = useFormContext<Proposal>()
  const handleSignDocument = useSignDocument<Proposal>(1, props.did)
  const handleCreate = trpc.proposal.create.useMutation()
  const handleClick = useCallback(
    async (proposal: Proposal) => {
      const signed = await handleSignDocument(proposal)
      if (signed) {
        return handleCreate.mutate(signed)
      }
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
