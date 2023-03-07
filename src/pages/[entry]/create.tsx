import { useEffect, useMemo } from 'react'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useMutation } from '@tanstack/react-query'

import useRouterQuery from '../../hooks/use-router-query'
import WorkgroupForm from '../../components/workgroup-form'
import CommunityLayout from '../../components/layouts/community'
import useWallet from '../../hooks/use-wallet'
import { trpc } from '../../utils/trpc'
import useDids from '../../hooks/use-dids'
import LoadingBar from '../../components/basic/loading-bar'
import { documentTitle } from '../../utils/constants'
import useSignDocument from '../../hooks/use-sign-document'
import { Community } from '../../utils/schemas/community'
import Notification from '../../components/basic/notification'

export default function CreateWorkgroupPage() {
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
  const newWorkgroup = useMemo(() => nanoid(), [])
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
      router.push(`/${query.entry}/${newWorkgroup}`)
    }
  }, [handleSubmit.isSuccess, newWorkgroup, query.entry, refetch, router])
  const initialValue = useMemo(
    () =>
      community && query.entry
        ? ({
            ...community,
            workgroups: [
              ...(community.workgroups || []),
              {
                id: newWorkgroup,
                name: '',
                permission: {
                  proposing: {
                    operation: 'or',
                    operands: [
                      {
                        function: 'prefixes_dot_suffix_exact_match',
                        arguments: [query.entry, ['']],
                      },
                    ],
                  },
                  voting: {
                    operation: 'max',
                    operands: [
                      {
                        function: 'prefixes_dot_suffix_fixed_power',
                        arguments: [query.entry, [''], '1'],
                      },
                    ],
                  },
                },
                duration: {
                  announcement: 86400,
                  voting: 86400,
                },
                extension: {
                  terms_and_conditions: '',
                },
              },
            ],
          } satisfies Community)
        : undefined,
    [community, newWorkgroup, query.entry],
  )

  return (
    <>
      <Head>
        <title>{`New workgroup - ${documentTitle}`}</title>
      </Head>
      <LoadingBar loading={isLoading} />
      <Notification show={handleSubmit.isError}>
        {handleSubmit.error?.message}
      </Notification>
      <CommunityLayout>
        <WorkgroupForm
          initialValue={initialValue}
          entry={query.entry || ''}
          workgroup={newWorkgroup}
          onSubmit={handleSubmit.mutate}
          isLoading={handleSubmit.isLoading}
          disabled={!isAdmin}
          className="pt-6 sm:pt-8"
        />
      </CommunityLayout>
    </>
  )
}
