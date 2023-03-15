import { useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

import useRouterQuery from '../../../hooks/use-router-query'
import useGroup from '../../../hooks/use-group'
import TextButton from '../../../components/basic/text-button'
import { permalink2Id } from '../../../utils/permalink'
import { formatDuration } from '../../../utils/time'
import { DetailItem, DetailList } from '../../../components/basic/detail'
import { trpc } from '../../../utils/trpc'
import Article from '../../../components/basic/article'
import LoadingBar from '../../../components/basic/loading-bar'
import ProposalForm from '../../../components/proposal-from'
import { documentTitle } from '../../../utils/constants'
import Markdown from '../../../components/basic/markdown'

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
        <title>{`New ${type} - ${documentTitle}`}</title>
      </Head>
      <div className="flex w-full flex-1 flex-col items-start sm:flex-row">
        <LoadingBar loading={isLoading} />
        <div className="w-full flex-1 pt-6 sm:mr-10 sm:w-0 sm:pt-8">
          <TextButton
            disabled={!query.entry || !query.group}
            href={`/${query.entry}/${query.group}`}
          >
            <h2 className="text-[1rem] font-semibold leading-6">← Back</h2>
          </TextButton>
          <ProposalForm
            community={community || undefined}
            group={group}
            onSuccess={handleSuccess}
            className="pt-6"
          />
        </div>
        <div className="relative mt-[-1px] w-full shrink-0 pt-6 sm:sticky sm:top-18 sm:w-80 sm:pt-8">
          <div className="space-y-6 rounded border border-gray-200 p-6">
            <DetailList title="Information">
              <DetailItem
                title="Community"
                className="truncate whitespace-nowrap"
              >
                {community?.name || '...'}
              </DetailItem>
              <DetailItem
                title="Workgroup"
                className="truncate whitespace-nowrap"
              >
                {group?.name || '...'}
              </DetailItem>
            </DetailList>
            <DetailList title="Duration">
              <DetailItem title="Pending">
                {group ? formatDuration(group.duration.pending) : null}
              </DetailItem>
              <DetailItem title="Voting">
                {group ? formatDuration(group.duration.voting) : null}
              </DetailItem>
            </DetailList>
            {group && 'terms_and_conditions' in group.extension ? (
              <DetailList title="Terms and conditions">
                <Article small className="pt-2">
                  <Markdown>{group.extension.terms_and_conditions}</Markdown>
                </Article>
              </DetailList>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}
