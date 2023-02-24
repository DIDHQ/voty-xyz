import clsx from 'clsx'
import { useAtomValue } from 'jotai'
import Link from 'next/link'

import useRouterQuery from '../hooks/use-router-query'
import { currentDidAtom } from '../utils/atoms'
import { trpc } from '../utils/trpc'
import Avatar from './basic/avatar'

export default function SubscriptionList(props: { className?: string }) {
  const query = useRouterQuery<['entry']>()
  const currentDid = useAtomValue(currentDidAtom)
  const { data } = trpc.subscription.list.useQuery(
    { subscriber: currentDid },
    { enabled: !!currentDid, refetchOnWindowFocus: false },
  )

  return (
    <div className={props.className}>
      {data?.map((community) => (
        <Link
          key={community.authorship.author}
          href={`/${community.authorship.author}`}
        >
          <Avatar
            size={12}
            name={community.authorship.author}
            value={community.extension?.avatar}
            noRing
            className={clsx(
              'mt-3 ring-2 ring-offset-2',
              community.authorship.author === query.entry
                ? 'ring-primary-500'
                : 'ring-transparent hover:ring-gray-300',
            )}
          />
        </Link>
      ))}
    </div>
  )
}
