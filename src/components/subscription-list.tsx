import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useId } from 'react'

import useRouterQuery from '../hooks/use-router-query'
import useWallet from '../hooks/use-wallet'
import { Authorized } from '../utils/schemas/authorship'
import { Community } from '../utils/schemas/community'
import { trpc } from '../utils/trpc'
import Avatar from './basic/avatar'

const Tooltip = dynamic(
  () => import('react-tooltip').then(({ Tooltip }) => Tooltip),
  { ssr: false },
)

export default function SubscriptionList() {
  const query = useRouterQuery<['entry']>()
  const { account } = useWallet()
  const { data } = trpc.subscription.list.useQuery(
    { subscriber: { type: 'eth_personal_sign', address: account?.address! } },
    { enabled: !!account?.address, refetchOnWindowFocus: false },
  )

  return (
    <div className="flex w-full flex-col items-center overflow-y-auto pb-1">
      {data?.map((community) => (
        <SubscriptionListItem
          key={community.authorship.author}
          value={community}
          selected={community.authorship.author === query.entry}
        />
      ))}
    </div>
  )
}

function SubscriptionListItem(props: {
  value: Authorized<Community>
  selected: boolean
}) {
  const id = useId()

  return (
    <>
      <Link
        data-tooltip-id={id}
        data-tooltip-place="right"
        href={`/${props.value.authorship.author}`}
        className="mt-3"
      >
        <Avatar
          size={12}
          name={props.value.authorship.author}
          value={props.value.extension?.avatar}
          noRing
          className={
            props.selected
              ? 'ring-2 ring-primary-500 ring-offset-2'
              : 'ring-1 ring-gray-200 hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
          }
        />
      </Link>
      <Tooltip id={id} className="rounded">
        {props.value.name}
      </Tooltip>
    </>
  )
}
