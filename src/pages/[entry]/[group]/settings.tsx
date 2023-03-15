import { useCallback } from 'react'
import { useRouter } from 'next/router'

import useRouterQuery from '../../../hooks/use-router-query'
import WorkgroupForm from '../../../components/workgroup-form'
import { trpc } from '../../../utils/trpc'
import LoadingBar from '../../../components/basic/loading-bar'
import TextButton from '../../../components/basic/text-button'
import useGroup from '../../../hooks/use-group'
import GrantForm from '../../../components/grant-form'

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
  const handleSuccess = useCallback(
    (isArchive: boolean) => {
      refetch()
      router.push(
        isArchive
          ? `/${query.entry}/about`
          : `/${query.entry}/${query.group}/rules`,
      )
    },
    [query.entry, query.group, refetch, router],
  )

  return (
    <>
      <LoadingBar loading={isLoading} />
      <div className="w-full">
        <TextButton
          href={`/${query.entry}/${query.group}/rules`}
          className="mt-6 sm:mt-8"
        >
          <h2 className="text-[1rem] font-semibold leading-6">← Back</h2>
        </TextButton>
        {group ? (
          group.extension.type === 'grant' ? (
            <GrantForm
              author={query.entry || ''}
              initialValue={community || undefined}
              group={query.group || ''}
              onSuccess={handleSuccess}
              className="pt-6 sm:pt-8"
            />
          ) : (
            <WorkgroupForm
              author={query.entry || ''}
              initialValue={community || undefined}
              group={query.group || ''}
              onSuccess={handleSuccess}
              className="pt-6 sm:pt-8"
            />
          )
        ) : null}
      </div>
    </>
  )
}
