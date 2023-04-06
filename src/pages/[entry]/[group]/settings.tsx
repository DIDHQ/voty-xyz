import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/router'

import useRouterQuery from '../../../hooks/use-router-query'
import WorkgroupForm from '../../../components/workgroup-form'
import { trpc } from '../../../utils/trpc'
import LoadingBar from '../../../components/basic/loading-bar'
import TextButton from '../../../components/basic/text-button'
import useGroup from '../../../hooks/use-group'

export default function GroupSettingsPage() {
  const router = useRouter()
  const query = useRouterQuery<['entry', 'group']>()
  const {
    data: community,
    isLoading,
    refetch,
  } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry },
  )
  const group = useGroup(community, query.group)
  const handleArchive = useCallback(() => {
    refetch()
    if (query.entry) {
      router.push(`/${query.entry}/about`)
    }
  }, [query.entry, refetch, router])
  useEffect(() => {
    if (community === null || (community && !group)) {
      router.push('/404')
    }
  }, [community, group, router])

  return (
    <>
      <LoadingBar loading={isLoading} />
      <div className="w-full">
        <TextButton
          href={`/${query.entry}/${query.group}/about`}
          className="mt-6 sm:mt-8"
        >
          <h2 className="text-[1rem] font-semibold leading-6">← Back</h2>
        </TextButton>
        {query.entry && query.group ? (
          <WorkgroupForm
            author={query.entry}
            initialValue={community || undefined}
            group={query.group}
            onArchive={handleArchive}
            preview={{
              from: `/${query.entry}/${query.group}/settings`,
              to: `/${query.entry}/${query.group}/about`,
              template: `You are updating workgroup on Voty\n\nhash:\n{sha256}`,
              author: query.entry,
              group: query.group,
            }}
            className="pt-6 sm:pt-8"
          />
        ) : null}
      </div>
    </>
  )
}
