import Link from 'next/link'

import useWallet from '../hooks/use-wallet'
import { Community } from '../utils/schemas/v1/community'
import { trpc } from '../utils/trpc'
import Avatar from './basic/avatar'
import Tooltip from './basic/tooltip'
import SectionHeader from './basic/section-header'

export default function SubscriptionList(props: { className?: string }) {
  const { account } = useWallet()
  const { data } = trpc.subscription.list.useQuery(
    { subscriber: { type: 'eth_personal_sign', address: account?.address! } },
    { enabled: !!account?.address },
  )

  return account ? (
    <div className={props.className}>
      <SectionHeader title="Subscribed"></SectionHeader>

      <div className="-m-1 w-full snap-x overflow-x-auto overflow-y-visible">
        <ul className="flex w-max items-center space-x-4 p-1">
          {data ? (
            data.length ? (
              data.map((community) => (
                <SubscriptionListItem key={community.id} value={community} />
              ))
            ) : (
              <li className="h-16 text-sm-regular text-subtle">
                No subscribed communities
              </li>
            )
          ) : (
            <li className="h-16"></li>
          )}
        </ul>
      </div>
    </div>
  ) : null
}

function SubscriptionListItem(props: { value: Community }) {
  return (
    <li className="snap-start rounded-full ring-2 ring-transparent ring-offset-2 ring-offset-[#F8FAFC] transition hover:ring-primary-500">
      <Tooltip place="top" text={props.value.name}>
        <Link href={`/${props.value.id}`}>
          <Avatar size={16} value={props.value.logo} />
        </Link>
      </Tooltip>
    </li>
  )
}
