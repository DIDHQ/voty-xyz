import { useEffect, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { PlusIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

import useRouterQuery from '../../../hooks/use-router-query'
import CommunityLayout from '../../../components/layouts/community'
import { trpc } from '../../../utils/trpc'
import EmptyState from '../../../components/empty-state'
import Select from '../../../components/basic/select'
import { GrantPhase } from '../../../utils/phase'
import GrantCard from '../../../components/grant-card'
import Button from '../../../components/basic/button'
import useIsManager from '../../../hooks/use-is-manager'
import SectionHeader from '@/src/components/basic/section-header'
import { InfoCardSkeleton } from '@/src/components/basic/skeleton'
import { formatDid } from '@/src/utils/did/utils'

export default function GrantsIndexPage() {
  const query = useRouterQuery<['communityId']>()
  const [phase, setPhase] = useState<GrantPhase | 'All'>('All')
  const { data, fetchNextPage, hasNextPage, isLoading } =
    trpc.grant.listByCommunityId.useInfiniteQuery(
      {
        communityId: query.communityId,
        phase: phase === 'All' ? undefined : phase,
      },
      { enabled: !!query.communityId, getNextPageParam: ({ next }) => next },
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
      GrantPhase.ANNOUNCING,
      GrantPhase.PROPOSING,
      GrantPhase.VOTING,
      GrantPhase.ENDED,
    ],
    [],
  )
  const isManager = useIsManager(query.communityId)

  return (
    <CommunityLayout loading={isLoading}>
      <SectionHeader title="Topic Grants">
        <div className="flex items-center">
          <Select
            options={options}
            value={phase}
            onChange={(p) => setPhase(p as GrantPhase | 'All')}
          />

          {isManager && query.communityId ? (
            <Link
              href={`/${formatDid(query.communityId)}/grant/create`}
              className="ml-5"
            >
              <Button primary icon={PlusIcon}>
                Topic Grant
              </Button>
            </Link>
          ) : null}
        </div>
      </SectionHeader>

      {grants?.length === 0 ? (
        <EmptyState
          title="No Topic Grants"
          description="Topic Grant helps you automate your project's funding process with ease, while also elevating member's engagement."
        />
      ) : !isLoading ? (
        <ul className="space-y-4 md:space-y-6">
          {grants?.map((grant) => (
            <li key={grant.permalink}>
              {query.communityId ? (
                <GrantCard communityId={query.communityId} grant={grant} />
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <InfoCardSkeleton />
      )}
      <div ref={ref} />
    </CommunityLayout>
  )
}
