import Link from 'next/link'

import useWallet from '../hooks/use-wallet'
import { Community } from '../utils/schemas/v1/community'
import { trpc } from '../utils/trpc'
import Avatar from './basic/avatar'
import Tooltip from './basic/tooltip'

export default function SubscriptionList(props: { className?: string }) {
  const { account } = useWallet()
  const { data } = trpc.subscription.list.useQuery(
    { subscriber: { type: 'eth_personal_sign', address: account?.address! } },
    { enabled: !!account?.address },
  )

  return account ? (
    <div className={props.className}>
      <h2 className="my-6 text-xl font-semibold sm:mt-8">Subscribed</h2>
      <ul className="-m-1 flex w-full items-center space-x-4 overflow-x-auto p-1">
        {data ? (
          data.length ? (
            data.map((community) => (
              <SubscriptionListItem key={community.id} value={community} />
            ))
          ) : (
            <div className="h-16 text-sm text-gray-400">
              No subscribed communities
            </div>
          )
        ) : (
          <div className="h-16"></div>
        )}
      </ul>
    </div>
  ) : null
}

function SubscriptionListItem(props: { value: Community }) {
  return (
    <li className="rounded-full ring-2 ring-transparent ring-offset-2 hover:ring-gray-300">
      <Tooltip place="top" text={props.value.name}>
        <Link href={`/${props.value.id}`}>
          <Avatar size={16} value={props.value.logo} />
        </Link>
      </Tooltip>
    </li>
  )
}
