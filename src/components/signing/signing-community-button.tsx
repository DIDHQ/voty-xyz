import { ExoticComponent, ReactNode, useCallback, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

import useAsync from '../../hooks/use-async'
import useSignDocument from '../../hooks/use-sign-document'
import { Community } from '../../utils/schemas/community'
import { trpc } from '../../utils/trpc'
import Button from '../basic/button'
import Notification from '../basic/notification'

export default function SigningCommunityButton(props: {
  did: string
  archive?: string
  icon?: ExoticComponent<{ className?: string }>
  onSuccess: (permalink: string) => void
  children: ReactNode
  className?: string
}) {
  const { onSuccess } = props
  const { handleSubmit: onSubmit } = useFormContext<Community>()
  const handleSignDocument = useSignDocument(
    props.did,
    `You are updating community settings of Voty\n\nhash:\n{sha256}`,
  )
  const handleCreate = trpc.community.create.useMutation()
  const handleSign = useAsync(
    useCallback(
      async (community: Community) => {
        const signed = await handleSignDocument({
          ...community,
          workgroups: community.workgroups?.filter(
            (workgroup) => workgroup.id !== props.archive,
          ),
        })
        if (signed) {
          return handleCreate.mutate(signed)
        }
      },
      [handleSignDocument, props.archive, handleCreate],
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
        primary={!props.archive}
        icon={props.icon}
        onClick={onSubmit(handleSign.execute, console.error)}
        loading={handleCreate.isLoading || handleSign.status === 'pending'}
        className={props.className}
      >
        {props.children}
      </Button>
    </>
  )
}
