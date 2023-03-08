import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useId } from 'react'

import useWallet from '../hooks/use-wallet'
import { Authorized } from '../utils/schemas/authorship'
import { Community } from '../utils/schemas/community'
import { trpc } from '../utils/trpc'
import Avatar from './basic/avatar'

const Tooltip = dynamic(
  () => import('react-tooltip').then(({ Tooltip }) => Tooltip),
  { ssr: false },
)

export default function SubscriptionList(props: { className?: string }) {
  const { account } = useWallet()
  const { data } = trpc.subscription.list.useQuery(
    { subscriber: { type: 'eth_personal_sign', address: account?.address! } },
    { enabled: !!account?.address, refetchOnWindowFocus: false },
  )

  return (
    <div className={props.className}>
      <h2 className="my-6 text-xl font-semibold sm:mt-8">Subscribed</h2>
      <ul className="-m-1 flex w-full items-center space-x-4 overflow-x-auto p-1">
        {data ? (
          data.length ? (
            data.map((community) => (
              <SubscriptionListItem
                key={community.authorship.author}
                value={community}
              />
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
  )
}

function SubscriptionListItem(props: { value: Authorized<Community> }) {
  const id = useId()

  return (
    <li>
      <Link
        data-tooltip-id={id}
        data-tooltip-place="top"
        href={`/${props.value.authorship.author}`}
        className="shrink-0"
      >
        <Avatar
          size={16}
          value={props.value.extension?.logo}
          noRing
          className="ring-1 ring-gray-200 hover:ring-2 hover:ring-gray-300 hover:ring-offset-2"
        />
      </Link>
      <Tooltip id={id} className="rounded">
        {props.value.name}
      </Tooltip>
    </li>
  )
}
