import { useEffect, useMemo } from 'react'
import { compact } from 'lodash-es'
import Head from 'next/head'
import Link from 'next/link'
import { useInView } from 'react-intersection-observer'
import { useAtomValue } from 'jotai'

import useGroup from '../../../hooks/use-group'
import { trpc } from '../../../utils/trpc'
import Article from '../../../components/basic/article'
import TextButton from '../../../components/basic/text-button'
import LoadingBar from '../../../components/basic/loading-bar'
import { documentTitle, previewPermalink } from '../../../utils/constants'
import useRouterQuery from '../../../hooks/use-router-query'
import Markdown from '../../../components/basic/markdown'
import Button from '../../../components/basic/button'
import { PlusIcon } from '@heroicons/react/20/solid'
import { permalink2Id } from '../../../utils/permalink'
import OptionCard from '../../../components/option-card'
import { getPeriod, Period } from '../../../utils/period'
import useStatus from '../../../hooks/use-status'
import ProposalInfo from '../../../components/proposal-info'
import { previewProposalAtom } from '../../../utils/atoms'
import { Proposal } from '../../../utils/schemas/proposal'

export default function RoundPage() {
  const query = useRouterQuery<['proposal']>()
  const previewProposal = useAtomValue(previewProposalAtom)
  const { data, isLoading } = trpc.proposal.getByPermalink.useQuery(
    { permalink: query.proposal },
    { enabled: !!query.proposal, refetchOnWindowFocus: false },
  )
  const proposal = useMemo<
    | (Proposal & { permalink: string; authorship?: { author?: string } })
    | undefined
  >(() => {
    if (previewProposal) {
      return {
        ...previewProposal,
        permalink: previewPermalink,
        authorship: { author: previewProposal.preview.author },
      }
    }
    return data || undefined
  }, [data, previewProposal])
  const { data: community, isLoading: isCommunityLoading } =
    trpc.community.getByPermalink.useQuery(
      { permalink: proposal?.community },
      { enabled: !!proposal?.community, refetchOnWindowFocus: false },
    )
  const group = useGroup(community, proposal?.group, 'grant')
  const { data: status } = useStatus(query.proposal)
  const period = useMemo(
    () => getPeriod(new Date(), status?.timestamp, group?.duration),
    [group?.duration, status?.timestamp],
  )
  const title = useMemo(
    () =>
      compact([
        proposal?.title,
        group?.name,
        community?.name,
        documentTitle,
      ]).join(' - '),
    [community?.name, proposal?.title, group?.name],
  )
  const {
    data: list,
    hasNextPage,
    fetchNextPage,
  } = trpc.option.list.useInfiniteQuery(
    { proposal: query.proposal },
    { enabled: !!query.proposal, getNextPageParam: ({ next }) => next },
  )
  const options = useMemo(() => list?.pages.flatMap(({ data }) => data), [list])
  const { ref, inView } = useInView()
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, inView])

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
              disabled={!!previewProposal || !community || !group}
              href={`/${community?.authorship.author}/${group?.id}`}
            >
              <h2 className="text-[1rem] font-semibold leading-6">← Back</h2>
            </TextButton>
            <div className="mb-6 border-b border-gray-200 pb-6">
              <h3 className="mt-4 line-clamp-2 break-words text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-4xl">
                {proposal?.title || '...'}
              </h3>
              <Article className="mt-6 sm:mt-8">
                <Markdown>{proposal?.extension?.content}</Markdown>
              </Article>
            </div>
            <ProposalInfo
              proposal={proposal}
              className="mb-6 block sm:hidden"
            />
            {query.proposal && period === Period.PROPOSING ? (
              <Link href={`/round/${permalink2Id(query.proposal)}/create`}>
                <Button icon={PlusIcon} primary className="float-right -mt-1">
                  Proposal
                </Button>
              </Link>
            ) : null}
            {proposal &&
            'options_count' in proposal &&
            proposal?.options_count ? (
              <h2 className="my-6 text-2xl font-bold">
                {proposal.options_count === 1
                  ? '1 Proposal'
                  : `${proposal.options_count} Proposals`}
              </h2>
            ) : null}
            <ul role="list" className="mt-5 space-y-5">
              {options?.map((option) => (
                <li key={option.permalink}>
                  <OptionCard option={option} />
                </li>
              ))}
            </ul>
            <div ref={ref} />
          </div>
          <ProposalInfo proposal={proposal} className="hidden sm:block" />
        </div>
      </div>
    </>
  )
}
