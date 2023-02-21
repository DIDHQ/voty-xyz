import { useMemo } from 'react'
import clsx from 'clsx'
import dynamic from 'next/dynamic'
import { startCase } from 'lodash-es'
import Link from 'next/link'

import useWorkgroup from '../../../../hooks/use-workgroup'
import useRouterQuery from '../../../../hooks/use-router-query'
import { stringifyChoice } from '../../../../utils/voting'
import { DetailItem, DetailList } from '../../../../components/basic/detail'
import { permalink2Url } from '../../../../utils/permalink'
import { trpc } from '../../../../utils/trpc'
import Article from '../../../../components/basic/article'
import TextButton from '../../../../components/basic/text-button'
import LoadingBar from '../../../../components/basic/loading-bar'

const VoteForm = dynamic(() => import('../../../../components/vote-form'), {
  ssr: false,
})

const StatusIcon = dynamic(() => import('../../../../components/status-icon'), {
  ssr: false,
})

const ProposalSchedule = dynamic(
  () => import('../../../../components/proposal-schedule'),
  { ssr: false },
)

export default function ProposalPage() {
  const query = useRouterQuery<['proposal']>()
  const { data: proposal, isLoading } = trpc.proposal.getByPermalink.useQuery(
    { permalink: query.proposal },
    { enabled: !!query.proposal },
  )
  const { data: community } = trpc.community.getByPermalink.useQuery(
    { permalink: proposal?.community },
    { enabled: !!proposal?.community },
  )
  const workgroup = useWorkgroup(community, proposal?.workgroup)
  const { data: list, refetch: refetchList } = trpc.vote.list.useInfiniteQuery(
    query,
    { enabled: !!query.proposal },
  )
  const votes = useMemo(() => list?.pages.flatMap(({ data }) => data), [list])

  return (
    <>
      <LoadingBar loading={isLoading} />
      {community && proposal && workgroup ? (
        <div className="flex w-full flex-1 flex-col items-start pt-6 sm:flex-row">
          <div className="w-full flex-1 sm:mr-6">
            <div className="mb-6 border-b border-gray-200 pb-6">
              <Link
                href={`/${community.authorship.author}/${proposal.workgroup}`}
              >
                <TextButton>
                  <h2 className="text-[1rem] font-semibold leading-6">
                    ← Back
                  </h2>
                </TextButton>
              </Link>
              <h3 className="mt-2 text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-4xl">
                {proposal.title}
              </h3>
              <Article className="mt-8">{proposal.extension?.body}</Article>
            </div>
            <VoteForm
              proposal={proposal}
              workgroup={workgroup}
              onSuccess={refetchList}
            />
            {votes?.length ? (
              <table className="mb-6 min-w-full border-separate border-spacing-0 border border-gray-200">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="sticky top-18 border-b border-gray-200 bg-white/80 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur"
                    >
                      DID
                    </th>
                    <th
                      scope="col"
                      className="sticky top-18 border-x border-b border-gray-200 bg-white/80 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur"
                    >
                      Choice
                    </th>
                    <th
                      scope="col"
                      className="sticky top-18 border-b border-gray-200 bg-white/80 py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900 backdrop-blur"
                    >
                      Power
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {votes.map((vote, index) => (
                    <tr key={vote.permalink}>
                      <td
                        className={clsx(
                          index === 0 ? undefined : 'border-t',
                          'whitespace-nowrap border-gray-200 py-4 pl-4 pr-3 text-sm font-medium text-gray-900',
                        )}
                      >
                        {vote.authorship.author}
                      </td>
                      <td
                        className={clsx(
                          index === 0 ? undefined : 'border-t',
                          'truncate whitespace-nowrap border-x border-gray-200 px-3 py-4 text-sm text-gray-500',
                        )}
                      >
                        {stringifyChoice(proposal.voting_type, vote.choice)}
                      </td>
                      <td
                        className={clsx(
                          index === 0 ? undefined : 'border-t',
                          'whitespace-nowrap border-gray-200 py-4 pl-3 pr-4 text-right text-sm font-medium',
                        )}
                      >
                        <a
                          href={permalink2Url(vote.permalink)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {vote.power}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
          <div className="relative w-full shrink-0 sm:sticky sm:top-24 sm:w-72">
            <StatusIcon
              permalink={query.proposal}
              className="absolute right-3 top-3"
            />
            <div className="space-y-6 border border-gray-200 p-6">
              <DetailList title="Proposal">
                <DetailItem title="Community">
                  <StatusIcon permalink={proposal.community}>
                    {community.name}
                  </StatusIcon>
                </DetailItem>
                <DetailItem title="Workgroup">{workgroup.name}</DetailItem>
                <DetailItem title="Proposer">
                  {proposal.authorship.author}
                </DetailItem>
                <DetailItem title="Voting type">
                  {startCase(proposal.voting_type)}
                </DetailItem>
              </DetailList>
              <ProposalSchedule
                proposal={query.proposal}
                duration={workgroup.duration}
              />
              <DetailList title="Terms and conditions">
                <Article small className="pt-2">
                  {workgroup?.extension.terms_and_conditions}
                </Article>
              </DetailList>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
