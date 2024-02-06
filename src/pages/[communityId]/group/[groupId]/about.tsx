import Link from 'next/link'
import { PencilIcon } from '@heroicons/react/20/solid'
import { useAtomValue } from 'jotai'

import useRouterQuery from '../../../../hooks/use-router-query'
import CommunityLayout from '../../../../components/layouts/community'
import GroupLayout from '../../../../components/layouts/group'
import { trpc } from '../../../../utils/trpc'
import Button from '../../../../components/basic/button'
import useIsManager from '../../../../hooks/use-is-manager'
import { previewGroupAtom } from '../../../../utils/atoms'
import GroupAbout from '../../../../components/group-about'
import Card from '@/src/components/basic/card'
import { AboutSkeleton } from '@/src/components/basic/skeleton'
import { formatDid } from '@/src/utils/did/utils'

export default function GroupAboutPage() {
  const query = useRouterQuery<['communityId', 'groupId']>()
  const previewGroup = useAtomValue(previewGroupAtom)
  const { data, isLoading } = trpc.group.getById.useQuery(
    { communityId: query.communityId, id: query.groupId },
    { enabled: !!query.communityId && !!query.groupId },
  )
  const group = previewGroup || data
  const isManager = useIsManager(query.communityId)

  return (
    <CommunityLayout loading={isLoading}>
      <GroupLayout>
        {isLoading ? <AboutSkeleton /> : null}

        {isManager && !previewGroup && query.communityId ? (
          <div className="mb-6 flex items-center justify-end">
            <Link
              href={`/${formatDid(query.communityId)}/group/${
                query.groupId
              }/settings`}
              className="block w-fit"
            >
              <Button icon={PencilIcon}>Edit</Button>
            </Link>
          </div>
        ) : null}

        {group?.introduction ? (
          <Card title="Introduction">
            <p className="break-words text-sm-regular text-strong">
              {group.introduction}
            </p>
          </Card>
        ) : null}

        {group ? <GroupAbout group={group} className="mt-6" /> : null}
      </GroupLayout>
    </CommunityLayout>
  )
}
