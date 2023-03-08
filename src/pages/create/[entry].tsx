import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useMutation } from '@tanstack/react-query'

import CommunityForm from '../../components/community-form'
import useRouterQuery from '../../hooks/use-router-query'
import useWallet from '../../hooks/use-wallet'
import useDids from '../../hooks/use-dids'
import TextButton from '../../components/basic/text-button'
import { documentTitle } from '../../utils/constants'
import { Community } from '../../utils/schemas/community'
import useSignDocument from '../../hooks/use-sign-document'
import { trpc } from '../../utils/trpc'
import Notification from '../../components/basic/notification'

export default function CreateEntryPage() {
  const router = useRouter()
  const query = useRouterQuery<['entry']>()
  const { account } = useWallet()
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
      router.push(`/${query.entry}`)
    }
  }, [handleSubmit.isSuccess, query.entry, router])

  return (
    <>
      <Head>
        <title>{`New community - ${documentTitle}`}</title>
      </Head>
      <Notification show={handleSubmit.isError}>
        {handleSubmit.error?.message}
      </Notification>
      <div className="w-full">
        <TextButton href="/create" className="mt-6 sm:mt-8">
          <h2 className="text-[1rem] font-semibold leading-6">← Back</h2>
        </TextButton>
        <CommunityForm
          isLoading={handleSubmit.isLoading}
          onSubmit={handleSubmit.mutate}
          disabled={!isAdmin}
          className="flex w-full flex-col"
        />
      </div>
    </>
  )
}
