import { ExoticComponent, ReactNode, useCallback, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

import { useUpload } from '../hooks/use-api'
import useAsync from '../hooks/use-async'
import useSignDocument from '../hooks/use-sign-document'
import { Community, Option, Proposal, Vote } from '../utils/schemas'
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
  const handleSignDocument = useSignDocument(props.did)
  const handleUpload = useUpload()
  const handleSubmit = useAsync(
    useCallback(
      async (document: T) => {
        const signed = await handleSignDocument(document)
        if (!signed) {
          throw new Error('signing failed')
        }
        return handleUpload(signed)
      },
      [handleSignDocument, handleUpload],
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
