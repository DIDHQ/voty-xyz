import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { useMutation } from '@tanstack/react-query'

import CommunityForm from '../../components/community-form'
import useRouterQuery from '../../hooks/use-router-query'
import CommunityLayout from '../../components/layouts/community'
import useWallet from '../../hooks/use-wallet'
import { trpc } from '../../utils/trpc'
import useDids from '../../hooks/use-dids'
import LoadingBar from '../../components/basic/loading-bar'
import Notification from '../../components/basic/notification'
import useSignDocument from '../../hooks/use-sign-document'
import { Community } from '../../utils/schemas/community'

export default function CommunitySettingsPage() {
  const router = useRouter()
  const query = useRouterQuery<['entry']>()
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
  const submit = useMutation<void, Error, Community>(async (community) => {
    const signed = await signDocument(community)
    if (signed) {
      await mutateAsync(signed)
    }
  })
  useEffect(() => {
    if (submit.isSuccess) {
      refetch()
      router.push(`/${query.entry}`)
    }
  }, [submit.isSuccess, query.entry, refetch, router])

  return (
    <CommunityLayout>
      <LoadingBar loading={isLoading} />
      <Notification show={submit.isError}>{submit.error?.message}</Notification>
      <CommunityForm
        initialValue={community || undefined}
        isLoading={submit.isLoading}
        onSubmit={submit.mutate}
        disabled={!isAdmin}
        className="flex w-full flex-col"
      />
    </CommunityLayout>
  )
}
