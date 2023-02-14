import { ExoticComponent, ReactNode, useCallback, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

import useSignDocument from '../../hooks/use-sign-document'
import { Community } from '../../utils/schemas'
import { trpc } from '../../utils/trpc'
import Button from '../basic/button'
import Notification from '../basic/notification'

export default function SigningCommunityButton(props: {
  did: string
  icon?: ExoticComponent<{ className?: string }>
  onSuccess: (permalink: string) => void
  disabled?: boolean
  children: ReactNode
  className?: string
}) {
  const { onSuccess } = props
  const { handleSubmit: onSubmit } = useFormContext<Community>()
  const handleSignDocument = useSignDocument<Community>(props.did)
  const handleCreate = trpc.community.create.useMutation()
  const handleClick = useCallback(
    async (community: Community) => {
      const signed = await handleSignDocument(community)
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
