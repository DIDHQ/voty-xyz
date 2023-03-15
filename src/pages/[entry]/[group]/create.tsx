import { useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

import useRouterQuery from '../../../hooks/use-router-query'
import useGroup from '../../../hooks/use-group'
import TextButton from '../../../components/basic/text-button'
import { permalink2Id } from '../../../utils/permalink'
import { trpc } from '../../../utils/trpc'
import LoadingBar from '../../../components/basic/loading-bar'
import ProposalForm from '../../../components/proposal-from'
import { documentTitle } from '../../../utils/constants'

export default function CreateProposalPage() {
  const router = useRouter()
  const query = useRouterQuery<['entry', 'group']>()
  const { data: community, isLoading } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry },
  )
  const group = useGroup(community, query.group)
  const type = group
    ? group.extension.type === 'grant'
      ? 'round'
      : 'proposal'
    : undefined
  const handleSuccess = useCallback(
    (permalink: string) => {
      router.push(`/${type}/${permalink2Id(permalink)}`)
    },
    [router, type],
  )

  return (
    <>
      <Head>
        <title>{`New ${type || ''} - ${documentTitle}`}</title>
      </Head>
      <LoadingBar loading={isLoading} />
      <div className="w-full">
        <TextButton
          disabled={!query.entry || !query.group}
          href={`/${query.entry}/${query.group}`}
          className="mt-6 sm:mt-8"
        >
          <h2 className="text-[1rem] font-semibold leading-6">← Back</h2>
        </TextButton>
        <ProposalForm
          community={community || undefined}
          group={group}
          onSuccess={handleSuccess}
          className="pt-6 sm:pt-8"
        />
      </div>
    </>
  )
}
