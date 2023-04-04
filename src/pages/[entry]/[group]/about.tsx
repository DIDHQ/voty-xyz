import Link from 'next/link'
import { PencilIcon } from '@heroicons/react/20/solid'
import { useAtomValue } from 'jotai'
import { BriefcaseIcon } from '@heroicons/react/24/outline'
import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'

import useRouterQuery from '../../../hooks/use-router-query'
import CommunityLayout from '../../../components/layouts/community'
import GroupLayout from '../../../components/layouts/group'
import { trpc } from '../../../utils/trpc'
import LoadingBar from '../../../components/basic/loading-bar'
import useGroup from '../../../hooks/use-group'
import Button from '../../../components/basic/button'
import useIsManager from '../../../hooks/use-is-manager'
import { previewCommunityAtom } from '../../../utils/atoms'
import RulesView from '../../../components/rules-view'
import { extractStartEmoji } from '../../../utils/emoji'

export default function GroupRulesPage() {
  const query = useRouterQuery<['entry', 'group']>()
  const router = useRouter()
  const { data, isLoading } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry },
  )
  const previewCommunity = useAtomValue(previewCommunityAtom)
  const community = previewCommunity || data
  const group = useGroup(community, query.group)
  const isManager = useIsManager(query.entry)
  const emoji = useMemo(() => extractStartEmoji(group?.name), [group?.name])
  const name = useMemo(
    () => group?.name.replace(emoji || '', ''),
    [emoji, group?.name],
  )
  useEffect(() => {
    if (community === null || (community && !group)) {
      router.push('/404')
    }
  }, [community, group, router])

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
          {group ? (
            <RulesView entry={query.entry} group={group} className="mt-6" />
          ) : null}
          {isManager && !previewCommunity ? (
            <Link
              href={`/${query.entry}/${query.group}/settings`}
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
