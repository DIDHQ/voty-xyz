import Head from 'next/head'
import { useRouter } from 'next/router'
import { useCallback } from 'react'

import LoadingBar from '../../../components/basic/loading-bar'
import TextButton from '../../../components/basic/text-button'
import OptionForm from '../../../components/option-form'
import useGroup from '../../../hooks/use-group'
import useRouterQuery from '../../../hooks/use-router-query'
import { documentTitle } from '../../../utils/constants'
import { permalink2Id } from '../../../utils/permalink'
import { trpc } from '../../../utils/trpc'

export default function CreateOptionPage() {
  const query = useRouterQuery<['proposal']>()
  const router = useRouter()
  const { data: proposal, isLoading } = trpc.proposal.getByPermalink.useQuery(
    { permalink: query.proposal },
    { enabled: !!query.proposal, refetchOnWindowFocus: false },
  )
  const { data: community, isLoading: isCommunityLoading } =
    trpc.community.getByPermalink.useQuery(
      { permalink: proposal?.community },
      { enabled: !!proposal?.community, refetchOnWindowFocus: false },
    )
  const group = useGroup(community, proposal?.group, 'grant')
  const handleSuccess = useCallback(
    (permalink: string) => {
      if (query.proposal) {
        router.push(
          `/round/${permalink2Id(query.proposal)}/${permalink2Id(permalink)}`,
        )
      }
    },
    [query.proposal, router],
  )

  return (
    <>
      <Head>
        <title>{`New round - ${documentTitle}`}</title>
      </Head>
      <LoadingBar loading={isLoading || isCommunityLoading} />
      <div className="w-full">
        <TextButton
          disabled={!query.proposal}
          href={
            query.proposal
              ? `/round/${permalink2Id(query.proposal)}`
              : undefined
          }
          className="mt-6 sm:mt-8"
        >
          <h2 className="text-[1rem] font-semibold leading-6">← Back</h2>
        </TextButton>
        <OptionForm
          entry={community?.authorship.author}
          proposal={proposal || undefined}
          group={group}
          onSuccess={handleSuccess}
          className="pt-6 sm:pt-8"
        />
      </div>
    </>
  )
}
