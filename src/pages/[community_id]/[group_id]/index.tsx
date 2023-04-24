import { useEffect, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'

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

export default function GroupIndexPage() {
  const query = useRouterQuery<['community_id', 'group_id']>()
  const [phase, setPhase] = useState<Phase | 'All'>('All')
  const { data, fetchNextPage, hasNextPage, isLoading } =
    trpc.proposal.list.useInfiniteQuery(
      {
        community_id: query.community_id,
        group_id: query.group_id,
        phase: phase === 'All' ? undefined : phase,
      },
      {
        enabled: !!query.community_id && !!query.group_id,
        getNextPageParam: ({ next }) => next,
      },
    )
  const { data: group } = trpc.group.getById.useQuery(
    { community_id: query.community_id, id: query.group_id },
    { enabled: !!query.community_id && !!query.group_id },
  )
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
            entry={query.community_id}
            group={group || undefined}
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
