import { ExoticComponent, ReactNode, useCallback, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

import useAsync from '../../hooks/use-async'
import useSignDocument from '../../hooks/use-sign-document'
import { Proposal } from '../../utils/schemas/proposal'
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
  const signDocument = useSignDocument(
    props.did,
    `You are creating proposal of Voty\n\nhash:\n{sha256}`,
  )
  const handleCreate = trpc.proposal.create.useMutation()
  const handleSign = useAsync(
    useCallback(
      async (proposal: Proposal) => {
        const signed = await signDocument(proposal)
        if (signed) {
          return handleCreate.mutate(signed)
        }
      },
      [signDocument, handleCreate],
    ),
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
      <Notification show={handleSign.status === 'error'}>
        {handleSign.error?.message}
      </Notification>
      <Button
        primary
        icon={props.icon}
        onClick={onSubmit(handleSign.execute, console.error)}
        disabled={props.disabled}
        loading={handleCreate.isLoading || handleSign.status === 'pending'}
        className={props.className}
      >
        {props.children}
      </Button>
    </>
  )
}
