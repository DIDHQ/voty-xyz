import Link from 'next/link'
import { PencilIcon } from '@heroicons/react/20/solid'
import { useAtomValue } from 'jotai'
import { BriefcaseIcon } from '@heroicons/react/24/outline'
import { useMemo } from 'react'

import useRouterQuery from '../../../hooks/use-router-query'
import CommunityLayout from '../../../components/layouts/community'
import GroupLayout from '../../../components/layouts/group'
import { trpc } from '../../../utils/trpc'
import LoadingBar from '../../../components/basic/loading-bar'
import Button from '../../../components/basic/button'
import useIsManager from '../../../hooks/use-is-manager'
import { previewGroupAtom } from '../../../utils/atoms'
import GroupAbout from '../../../components/group-about'
import { extractStartEmoji } from '../../../utils/emoji'

export default function GroupAboutPage() {
  const query = useRouterQuery<['community_id', 'group_id']>()
  const previewGroup = useAtomValue(previewGroupAtom)
  const { data, isLoading } = trpc.group.getById.useQuery(
    { community_id: query.community_id, id: query.group_id },
    { enabled: !!query.community_id && !!query.group_id },
  )
  const group = previewGroup || data
  const isManager = useIsManager(query.community_id)
  const emoji = useMemo(() => extractStartEmoji(group?.name), [group?.name])
  const name = useMemo(
    () => group?.name.replace(emoji || '', ''),
    [emoji, group?.name],
  )

  return (
    <>
      <LoadingBar loading={isLoading} />
      <CommunityLayout>
        <GroupLayout>
          <div className="mt-6 flex items-center">
            {emoji ? (
              <span
                className="mr-3 w-8 shrink-0 text-center text-3xl text-gray-400"
                aria-hidden="true"
              >
                {emoji}
              </span>
            ) : (
              <BriefcaseIcon
                className="mr-3 h-8 w-8 shrink-0 text-gray-400"
                aria-hidden="true"
              />
            )}
            <h3 className="mr-4 w-0 flex-1 truncate text-2xl font-medium text-gray-900">
              {name || '...'}
            </h3>
          </div>
          {group?.extension.introduction ? (
            <p className="mt-2 text-sm text-gray-500">
              {group.extension.introduction}
            </p>
          ) : null}
          {group ? <GroupAbout group={group} className="mt-6" /> : null}
          {isManager && !previewGroup ? (
            <Link
              href={`/${query.community_id}/${query.group_id}/settings`}
              className="mt-6 block w-fit sm:mt-8"
            >
              <Button icon={PencilIcon}>Edit</Button>
            </Link>
          ) : null}
        </GroupLayout>
      </CommunityLayout>
    </>
  )
}
