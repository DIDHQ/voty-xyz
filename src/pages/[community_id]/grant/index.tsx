import { useEffect, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { PlusIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

import useRouterQuery from '../../../hooks/use-router-query'
import CommunityLayout from '../../../components/layouts/community'
import { trpc } from '../../../utils/trpc'
import LoadingBar from '../../../components/basic/loading-bar'
import EmptyState from '../../../components/empty-state'
import Select from '../../../components/basic/select'
import { GrantPhase } from '../../../utils/phase'
import GrantCard from '../../../components/grant-card'
import Button from '../../../components/basic/button'

export default function GrantsIndexPage() {
  const query = useRouterQuery<['community_id']>()
  const [phase, setPhase] = useState<GrantPhase | 'All'>('All')
  const { data, fetchNextPage, hasNextPage, isLoading } =
    trpc.grant.listByCommunityId.useInfiniteQuery(
      { communityId: query.community_id },
      {
        enabled: !!query.community_id,
        getNextPageParam: ({ next }) => next,
      },
    )
  const grants = useMemo(() => data?.pages.flatMap(({ data }) => data), [data])
  const { ref, inView } = useInView()
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, inView])
  const options = useMemo(
    () => [
      'All',
      GrantPhase.CONFIRMING,
      GrantPhase.ANNOUNCING,
      GrantPhase.PROPOSING,
      GrantPhase.VOTING,
      GrantPhase.ENDED,
    ],
    [],
  )

  return (
    <CommunityLayout>
      <LoadingBar loading={isLoading} />
      <div className="mb-5 mt-8 flex justify-between">
        <Select
          options={options}
          value={phase}
          onChange={(p) => setPhase(p as GrantPhase | 'All')}
        />
        <Link href={`/${query.community_id}/grant/create`}>
          <Button primary icon={PlusIcon}>
            Grant
          </Button>
        </Link>
      </div>
      {grants?.length === 0 ? (
        <EmptyState title="No proposals" className="mt-24" />
      ) : (
        <ul role="list" className="mt-5 space-y-5">
          {grants?.map((grant) => (
            <li key={grant.permalink}>
              {query.community_id ? (
                <GrantCard communityId={query.community_id} grant={grant} />
              ) : null}
            </li>
          ))}
        </ul>
      )}
      <div ref={ref} />
    </CommunityLayout>
  )
}
