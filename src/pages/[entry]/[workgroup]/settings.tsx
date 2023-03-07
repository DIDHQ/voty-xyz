import { useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'

import useRouterQuery from '../../../hooks/use-router-query'
import WorkgroupForm from '../../../components/workgroup-form'
import CommunityLayout from '../../../components/layouts/community'
import WorkgroupLayout from '../../../components/layouts/workgroup'
import useWallet from '../../../hooks/use-wallet'
import { trpc } from '../../../utils/trpc'
import useDids from '../../../hooks/use-dids'
import LoadingBar from '../../../components/basic/loading-bar'
import useSignDocument from '../../../hooks/use-sign-document'
import useAsync from '../../../hooks/use-async'
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
  const handleSubmit = useAsync(
    useCallback(
      async (community: Community) => {
        const signed = await signDocument(community)
        if (signed) {
          return mutateAsync(signed)
        }
      },
      [signDocument, mutateAsync],
    ),
  )
  useEffect(() => {
    if (handleSubmit.status === 'success') {
      refetch()
      router.push(`/${query.entry}/${query.workgroup}`)
    }
  }, [handleSubmit.status, query.entry, query.workgroup, refetch, router])
  const handleArchive = useAsync(
    useCallback(
      async (community: Community) => {
        const signed = await signDocument({
          ...community,
          workgroups: community.workgroups?.filter(
            ({ id }) => id !== query.workgroup,
          ),
        })
        if (signed) {
          return mutateAsync(signed)
        }
      },
      [signDocument, query.workgroup, mutateAsync],
    ),
  )
  useEffect(() => {
    if (handleArchive.status === 'success') {
      refetch()
      router.push(`/${query.entry}`)
    }
  }, [handleArchive.status, query.entry, refetch, router])

  return (
    <>
      <LoadingBar loading={isLoading} />
      <Notification show={handleSubmit.status === 'error'}>
        {handleSubmit.error?.message}
      </Notification>
      <Notification show={handleArchive.status === 'error'}>
        {handleArchive.error?.message}
      </Notification>
      <CommunityLayout>
        <WorkgroupLayout>
          <WorkgroupForm
            initialValue={community || undefined}
            entry={query.entry || ''}
            workgroup={query.workgroup || ''}
            onSubmit={handleSubmit.execute}
            isLoading={handleSubmit.status === 'pending'}
            onArchive={handleArchive.execute}
            isArchiving={handleArchive.status === 'pending'}
            disabled={!isAdmin}
            className="pt-6 sm:pt-8"
          />
        </WorkgroupLayout>
      </CommunityLayout>
    </>
  )
}
