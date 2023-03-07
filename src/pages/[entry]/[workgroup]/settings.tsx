import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { useMutation } from '@tanstack/react-query'

import useRouterQuery from '../../../hooks/use-router-query'
import WorkgroupForm from '../../../components/workgroup-form'
import CommunityLayout from '../../../components/layouts/community'
import WorkgroupLayout from '../../../components/layouts/workgroup'
import useWallet from '../../../hooks/use-wallet'
import { trpc } from '../../../utils/trpc'
import useDids from '../../../hooks/use-dids'
import LoadingBar from '../../../components/basic/loading-bar'
import useSignDocument from '../../../hooks/use-sign-document'
import { Community } from '../../../utils/schemas/community'
import Notification from '../../../components/basic/notification'

export default function WorkgroupSettingsPage() {
  const router = useRouter()
  const query = useRouterQuery<['entry', 'workgroup']>()
  const { account } = useWallet()
  const {
    data: community,
    isLoading,
    refetch,
  } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry, refetchOnWindowFocus: false },
  )
  const { data: dids } = useDids(account)
  const isAdmin = useMemo(
    () => !!(query.entry && dids?.includes(query.entry)),
    [dids, query.entry],
  )
  const signDocument = useSignDocument(
    query.entry,
    `You are updating community of Voty\n\nhash:\n{sha256}`,
  )
  const { mutateAsync } = trpc.community.create.useMutation()
  const handleSubmit = useMutation<void, Error, Community>(
    async (community) => {
      const signed = await signDocument(community)
      if (signed) {
        await mutateAsync(signed)
      }
    },
  )
  useEffect(() => {
    if (handleSubmit.isSuccess) {
      refetch()
      router.push(`/${query.entry}/${query.workgroup}`)
    }
  }, [handleSubmit.isSuccess, query.entry, query.workgroup, refetch, router])
  const handleArchive = useMutation<void, Error, Community>(
    async (community) => {
      const signed = await signDocument({
        ...community,
        workgroups: community.workgroups?.filter(
          ({ id }) => id !== query.workgroup,
        ),
      })
      if (signed) {
        await mutateAsync(signed)
      }
    },
  )
  useEffect(() => {
    if (handleArchive.isSuccess) {
      refetch()
      router.push(`/${query.entry}`)
    }
  }, [handleArchive.isSuccess, query.entry, refetch, router])

  return (
    <>
      <LoadingBar loading={isLoading} />
      <Notification show={handleSubmit.isError}>
        {handleSubmit.error?.message}
      </Notification>
      <Notification show={handleArchive.isError}>
        {handleArchive.error?.message}
      </Notification>
      <CommunityLayout>
        <WorkgroupLayout>
          <WorkgroupForm
            initialValue={community || undefined}
            entry={query.entry || ''}
            workgroup={query.workgroup || ''}
            onSubmit={handleSubmit.mutate}
            isLoading={handleSubmit.isLoading}
            onArchive={handleArchive.mutate}
            isArchiving={handleArchive.isLoading}
            disabled={!isAdmin}
            className="pt-6 sm:pt-8"
          />
        </WorkgroupLayout>
      </CommunityLayout>
    </>
  )
}
