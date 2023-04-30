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
import useIsManager from '../../../hooks/use-is-manager'

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
  const isManager = useIsManager(query.community_id)

  return (
    <CommunityLayout>
      <LoadingBar loading={isLoading} />
      <div className="mt-6 flex items-center justify-between sm:mt-8">
        <div className="flex items-center">
          <h3 className="text-lg font-medium text-gray-900">Grants</h3>
          {isManager ? (
            <Link href={`/${query.community_id}/grant/create`} className="ml-8">
              <Button primary icon={PlusIcon}>
                Grant
              </Button>
            </Link>
          ) : null}
        </div>
        <Select
          options={options}
          value={phase}
          onChange={(p) => setPhase(p as GrantPhase | 'All')}
        />
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
