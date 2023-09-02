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

        {group?.introduction ? (
          <Card title="Introduction">
            <p className="break-words text-sm-regular text-strong">
              {group.introduction}
            </p>
          </Card>
        ) : null}

        {group ? <GroupAbout group={group} className="mt-6" /> : null}

        {isManager && !previewGroup ? (
          <Link
            href={`/${query.communityId}/group/${query.groupId}/settings`}
            className="mt-6 block w-fit sm:mt-8"
          >
            <Button icon={PencilIcon}>Edit</Button>
          </Link>
        ) : null}
      </GroupLayout>
    </CommunityLayout>
  )
}
