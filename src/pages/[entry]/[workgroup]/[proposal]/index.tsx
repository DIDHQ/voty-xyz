import { useCallback, useEffect, useMemo } from 'react'
import clsx from 'clsx'
import dynamic from 'next/dynamic'
import { compact, startCase } from 'lodash-es'
import { useInView } from 'react-intersection-observer'
import Head from 'next/head'
import { createProxySSGHelpers } from '@trpc/react-query/ssg'
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'

import useWorkgroup from '../../../../hooks/use-workgroup'
import { stringifyChoice } from '../../../../utils/voting'
import { DetailItem, DetailList } from '../../../../components/basic/detail'
import { id2Permalink, permalink2Url } from '../../../../utils/permalink'
import { trpc } from '../../../../utils/trpc'
import Article from '../../../../components/basic/article'
import TextButton from '../../../../components/basic/text-button'
import LoadingBar from '../../../../components/basic/loading-bar'
import { documentTitle } from '../../../../utils/constants'
import { appRouter } from '../../../../server/routers/_app'
import VoteForm from '../../../../components/vote-form'
import useRouterQuery from '../../../../hooks/use-router-query'
import Slide from '../../../../components/basic/slide'

const StatusIcon = dynamic(() => import('../../../../components/status-icon'), {
  ssr: false,
})

const ProposalSchedule = dynamic(
  () => import('../../../../components/proposal-schedule'),
  {
    ssr: false,
    loading: () => (
      <DetailList title="Schedule">
        <DetailItem title="Period">{null}</DetailItem>
        <DetailItem title="Start">...</DetailItem>
        <DetailItem title="End">...</DetailItem>
      </DetailList>
    ),
  },
)

export const getServerSideProps: GetServerSideProps<{
  proposal: string
}> = async (context) => {
  const proposal = id2Permalink(context.params!.proposal as string)

  const ssg = createProxySSGHelpers({ router: appRouter, ctx: {} })
  await ssg.proposal.getByPermalink.prefetch({ permalink: proposal })

  return { props: { trpcState: ssg.dehydrate(), proposal } }
}

export default function ProposalPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const query = useRouterQuery<['entry', 'workgroup']>()
  const { data: proposal, isLoading } = trpc.proposal.getByPermalink.useQuery(
    { permalink: props.proposal },
    { enabled: !!props.proposal, refetchOnWindowFocus: false },
  )
  const { data: community, isLoading: isCommunityLoading } =
    trpc.community.getByPermalink.useQuery(
      { permalink: proposal?.community },
      { enabled: !!proposal?.community, refetchOnWindowFocus: false },
    )
  const workgroup = useWorkgroup(community, proposal?.workgroup)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    refetch: refetchList,
  } = trpc.vote.list.useInfiniteQuery(
    { proposal: props.proposal },
    {
      enabled: !!props.proposal,
      getNextPageParam: ({ next }) => next,
      refetchOnWindowFocus: false,
    },
  )
  const votes = useMemo(() => data?.pages.flatMap(({ data }) => data), [data])
  const { ref, inView } = useInView()
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, inView])
  const renderCard = useCallback(
    (className?: string) => (
      <div
        className={clsx(
          'relative w-full shrink-0 pt-6 sm:sticky sm:top-18 sm:w-72 sm:pt-8',
          className,
        )}
      >
        <StatusIcon
          permalink={props.proposal}
          className="absolute right-4 top-10 sm:top-12"
        />
        <div className="space-y-6 rounded border border-gray-200 p-6">
          <DetailList title="Proposal">
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
              {workgroup?.name || '...'}
            </DetailItem>
            <DetailItem title="Proposer" className="truncate whitespace-nowrap">
              {proposal?.authorship.author}
            </DetailItem>
            <DetailItem title="Voting type">
              {startCase(proposal?.voting_type)}
            </DetailItem>
          </DetailList>
          <DetailList title="Voters">
            {workgroup?.permission.voting.operands.map((operand, index) => (
              <DetailItem
                key={operand.function + index}
                title={operand.alias || `Group ${index}`}
                className="truncate whitespace-nowrap"
              >
                <Slide
                  title="Voters"
                  trigger={({ handleOpen }) => (
                    <TextButton secondary onClick={handleOpen}>
                      View
                    </TextButton>
                  )}
                  small
                >
                  {() => (
                    <DetailList title={operand.alias || `Group ${index}`}>
                      <DetailItem title="Base on">
                        {operand.arguments[0] === 'bit' ? '.bit' : 'SubDID'}
                      </DetailItem>
                      <DetailItem title="Filter">
                        {operand.arguments[1].length ? 'Allowlist' : 'All'}
                      </DetailItem>
                      {operand.arguments[1].length ? (
                        <DetailItem title="Allowlist">
                          {operand.arguments[1]
                            .map(
                              (argument) =>
                                `${argument}.${operand.arguments[0]}`,
                            )
                            .join('\n')}
                        </DetailItem>
                      ) : null}
                      <DetailItem title="Power">
                        {operand.arguments[2]}
                      </DetailItem>
                    </DetailList>
                  )}
                </Slide>
              </DetailItem>
            ))}
          </DetailList>
          <ProposalSchedule
            proposal={props.proposal}
            duration={workgroup?.duration}
          />
          <DetailList title="Terms and conditions">
            <Article small className="pt-2">
              {workgroup?.extension.terms_and_conditions}
            </Article>
          </DetailList>
        </div>
      </div>
    ),
    [community, proposal, props.proposal, workgroup],
  )
  const title = useMemo(
    () =>
      compact([
        proposal?.title,
        workgroup?.name,
        community?.name,
        documentTitle,
      ]).join(' - '),
    [community?.name, proposal?.title, workgroup?.name],
  )
  useEffect(() => {
    if (community && community.authorship.author !== query.entry) {
      throw new Error('community mismatch')
    }
  }, [community, query.entry])
  useEffect(() => {
    if (workgroup && workgroup.id !== query.workgroup) {
      throw new Error('workgroup mismatch')
    }
  }, [workgroup, query.workgroup])

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="w-full">
        <LoadingBar loading={isLoading || isCommunityLoading} />
        <div className="flex w-full flex-1 flex-col items-start sm:flex-row">
          <div className="w-full flex-1 pt-6 sm:mr-10 sm:w-0 sm:pt-8">
            <TextButton
              href={
                community && proposal
                  ? `/${community.authorship.author}/${proposal.workgroup}`
                  : undefined
              }
            >
              <h2 className="text-[1rem] font-semibold leading-6">← Back</h2>
            </TextButton>
            <div className="mb-6 border-b border-gray-200 pb-6">
              <h3 className="mt-4 break-words text-3xl font-bold leading-8 tracking-tight text-gray-900 line-clamp-2 sm:text-4xl">
                {proposal?.title}
              </h3>
              <Article className="mt-8">{proposal?.extension?.body}</Article>
            </div>
            {renderCard('block sm:hidden mb-6')}
            <VoteForm
              proposal={proposal || undefined}
              workgroup={workgroup}
              onSuccess={refetchList}
            />
            {proposal?.votes ? (
              <h2 className="my-6 border-t border-gray-200 pt-6 text-2xl font-bold">
                {proposal.votes === 1 ? '1 Vote' : `${proposal.votes} Votes`}
              </h2>
            ) : null}
            {votes?.length ? (
              <table className="my-6 w-full border-separate border-spacing-0 rounded border border-gray-200">
                <colgroup>
                  <col width="40%" />
                  <col width="50%" />
                  <col width="10%" />
                </colgroup>
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="sticky top-18 rounded-t border-b border-gray-200 bg-white/80 py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur"
                    >
                      DID
                    </th>
                    <th
                      scope="col"
                      className="sticky top-18 border-x border-b border-gray-200 bg-white/80 px-3 py-2 text-left text-sm font-semibold text-gray-900 backdrop-blur"
                    >
                      Choice
                    </th>
                    <th
                      scope="col"
                      className="sticky top-18 rounded-t border-b border-gray-200 bg-white/80 py-2 pl-3 pr-4 text-right text-sm font-semibold text-gray-900 backdrop-blur"
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
                          'max-w-0 truncate whitespace-nowrap border-gray-200 py-2 pl-4 pr-3 text-sm font-medium text-gray-900',
                        )}
                      >
                        {vote.authorship.author}
                      </td>
                      <td
                        className={clsx(
                          index === 0 ? undefined : 'border-t',
                          'max-w-0 truncate whitespace-nowrap border-x border-gray-200 px-3 py-2 text-sm text-gray-500',
                        )}
                      >
                        {proposal
                          ? stringifyChoice(proposal.voting_type, vote.choice)
                          : vote.choice}
                      </td>
                      <td
                        className={clsx(
                          index === 0 ? undefined : 'border-t',
                          'max-w-0 truncate whitespace-nowrap border-gray-200 py-2 pl-3 pr-4 text-right text-sm font-medium',
                        )}
                      >
                        <TextButton
                          primary
                          href={permalink2Url(vote.permalink)}
                        >
                          {vote.power}
                        </TextButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
          {renderCard('hidden sm:block')}
        </div>
        <div ref={ref} />
      </div>
    </>
  )
}
