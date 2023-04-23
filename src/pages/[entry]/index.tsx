import { useEffect, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/20/solid'

import useRouterQuery from '../../hooks/use-router-query'
import ProposalCard from '../../components/proposal-card'
import CommunityLayout from '../../components/layouts/community'
import { trpc } from '../../utils/trpc'
import LoadingBar from '../../components/basic/loading-bar'
import Button from '../../components/basic/button'
import EmptyState from '../../components/empty-state'
import useIsManager from '../../hooks/use-is-manager'
import Select from '../../components/basic/select'
import { Phase } from '../../utils/phase'

export default function CommunityIndexPage() {
  const query = useRouterQuery<['entry']>()
  const [phase, setPhase] = useState<Phase | 'All'>('All')
  const { data: community, isLoading } = trpc.community.getById.useQuery(
    { id: query.entry },
    { enabled: !!query.entry },
  )
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading: isListLoading,
  } = trpc.proposal.list.useInfiniteQuery(
    { community_id: query.entry, phase: phase === 'All' ? undefined : phase },
    { enabled: !!query.entry, getNextPageParam: ({ next }) => next },
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
  const isManager = useIsManager(query.entry)
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
      <LoadingBar loading={isLoading || isListLoading} />
      <div className="mt-6 flex justify-between sm:mt-8">
        <h3 className="text-lg font-medium text-gray-900">Timeline</h3>
        <Select
          options={options}
          value={phase}
          onChange={(p) => setPhase(p as Phase | 'All')}
          className="-mt-1 sm:-mt-2"
        />
      </div>
      {proposals?.length === 0 ? (
        <EmptyState
          title="No events"
          className="mt-24"
          footer={
            community && !community?.groups?.length && isManager ? (
              <Link href={`/${query.entry}/create`}>
                <Button primary icon={PlusIcon}>
                  Workgroup
                </Button>
              </Link>
            ) : undefined
          }
        />
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
    </CommunityLayout>
  )
}
