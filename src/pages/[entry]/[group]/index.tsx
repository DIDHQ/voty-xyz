import { useEffect, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { useRouter } from 'next/router'

import useRouterQuery from '../../../hooks/use-router-query'
import ProposalCard from '../../../components/proposal-card'
import CommunityLayout from '../../../components/layouts/community'
import GroupLayout from '../../../components/layouts/group'
import { trpc } from '../../../utils/trpc'
import LoadingBar from '../../../components/basic/loading-bar'
import EmptyState from '../../../components/empty-state'
import CreateProposalButton from '../../../components/create-proposal-button'
import Select from '../../../components/basic/select'
import { Phase } from '../../../utils/phase'
import useGroup from '../../../hooks/use-group'

export default function GroupIndexPage() {
  const query = useRouterQuery<['entry', 'group']>()
  const router = useRouter()
  const [phase, setPhase] = useState<Phase | 'All'>('All')
  const { data, fetchNextPage, hasNextPage, isLoading } =
    trpc.proposal.list.useInfiniteQuery(
      {
        entry: query.entry,
        group: query.group,
        phase: phase === 'All' ? undefined : phase,
      },
      {
        enabled: !!query.entry && !!query.group,
        getNextPageParam: ({ next }) => next,
      },
    )
  const { data: community } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry },
  )
  const group = useGroup(community, query.group)
  const proposals = useMemo(
    () => data?.pages.flatMap(({ data }) => data),
    [data],
  )
  const { ref, inView } = useInView()
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, inView])
  const options = useMemo(
    () => [
      'All',
      Phase.CONFIRMING,
      Phase.ANNOUNCING,
      Phase.VOTING,
      Phase.ENDED,
    ],
    [],
  )
  useEffect(() => {
    if (community === null || (community && !group)) {
      router.push('/404')
    }
  }, [community, group, router])

  return (
    <CommunityLayout>
      <GroupLayout>
        <LoadingBar loading={isLoading} />
        <div className="my-5 flex justify-between">
          <Select
            options={options}
            value={phase}
            onChange={(p) => setPhase(p as Phase | 'All')}
          />
          <CreateProposalButton
            entry={query.entry}
            group={group}
            community={community?.permalink}
          />
        </div>
        {proposals?.length === 0 ? (
          <EmptyState title="No proposals" className="mt-24" />
        ) : (
          <ul role="list" className="mt-5 space-y-5">
            {proposals?.map((proposal) => (
              <li key={proposal.permalink}>
                <ProposalCard proposal={proposal} />
              </li>
            ))}
          </ul>
        )}
        <div ref={ref} />
      </GroupLayout>
    </CommunityLayout>
  )
}
