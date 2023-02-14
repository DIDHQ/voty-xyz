import { ExoticComponent, ReactNode, useCallback, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

import useAsync from '../hooks/use-async'
import useSignDocument from '../hooks/use-sign-document'
import { isCommunity, isProposal, isVote } from '../utils/data-type'
import { Community, Option, Proposal, Vote } from '../utils/schemas'
import { trpc } from '../utils/trpc'
import Button from './basic/button'
import Notification from './basic/notification'

export default function SigningButton<
  T extends Community | Proposal | Option | Vote,
>(props: {
  did: string
  icon?: ExoticComponent<{ className?: string }>
  onSuccess: (permalink: string) => void
  disabled?: boolean
  children: ReactNode
  className?: string
}) {
  const { onSuccess } = props
  const { handleSubmit: onSubmit } = useFormContext<T>()
  const handleSignDocument = useSignDocument<T>(props.did)
  const handleUploadCommunity = trpc.community.create.useMutation()
  const handleUploadProposal = trpc.proposal.create.useMutation()
  const handleUploadVote = trpc.vote.create.useMutation()
  const handleSubmit = useAsync(
    useCallback(
      async (document: T) => {
        const signed = await handleSignDocument(document)
        if (!signed) {
          throw new Error('signing failed')
        }
        if (isCommunity(signed)) {
          return handleUploadCommunity.mutate(signed)
        } else if (isProposal(signed)) {
          return handleUploadProposal.mutate(signed)
        } else if (isVote(signed)) {
          return handleUploadVote.mutate(signed)
        }
      },
      [
        handleSignDocument,
        handleUploadCommunity,
        handleUploadProposal,
        handleUploadVote,
      ],
    ),
  )
  useEffect(() => {
    if (handleSubmit.value) {
      onSuccess(handleSubmit.value)
    }
  }, [handleSubmit.value, onSuccess])

  return (
    <>
      <Notification show={handleSubmit.status === 'error'}>
        {handleSubmit.error?.message}
      </Notification>
      <Button
        primary
        icon={props.icon}
        onClick={onSubmit(handleSubmit.execute, console.error)}
        disabled={props.disabled}
        loading={handleSubmit.status === 'pending'}
        className={props.className}
      >
        {props.children}
      </Button>
    </>
  )
}
