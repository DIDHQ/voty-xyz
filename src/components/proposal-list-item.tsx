import { HandRaisedIcon, Square2StackIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import Link from 'next/link'
import { useMemo } from 'react'

import useStatus from '../hooks/use-status'
import useWorkgroup from '../hooks/use-workgroup'
import { getPeriod, Period } from '../utils/duration'
import { permalink2Id } from '../utils/permalink'
import { Authorized } from '../utils/schemas/authorship'
import { Proposal } from '../utils/schemas/proposal'
import { trpc } from '../utils/trpc'

export default function ProposalListItem(props: {
  entry: string
  proposal: Authorized<Proposal> & { permalink: string }
}) {
  const { data: community } = trpc.community.getByEntry.useQuery({
    entry: props.entry,
  })
  const workgroup = useWorkgroup(community, props.proposal.workgroup)
  const { data: status } = useStatus(props.proposal.permalink)
  const period = useMemo(
    () =>
      workgroup?.duration && status?.timestamp
        ? getPeriod(Date.now() / 1000, status?.timestamp, workgroup?.duration)
        : Period.PENDING,
    [status?.timestamp, workgroup?.duration],
  )

  return (
    <Link
      href={`/${props.entry}/${props.proposal.workgroup}/${permalink2Id(
        props.proposal.permalink,
      )}`}
      className="group block space-y-2 border-b border-gray-200 py-6 px-0"
    >
      <div className="flex w-full items-center justify-between">
        <p className="truncate font-medium text-indigo-600 group-hover:underline">
          {props.proposal.title}
        </p>
        <p
          className={clsx(
            'float-right inline-flex rounded-full px-3 py-0.5 text-sm font-medium',
            {
              [Period.PENDING]: 'bg-gray-100 text-gray-800',
              [Period.ANNOUNCING]: 'bg-yellow-100 text-yellow-800',
              [Period.ADDING_OPTION]: 'bg-blue-100 text-blue-800',
              [Period.VOTING]: 'bg-green-100 text-green-800',
              [Period.ENDED]: 'bg-red-100 text-red-800',
            }[period],
          )}
        >
          {period}
        </p>
      </div>
      <p className="text-gray-600 line-clamp-3">
        {props.proposal.extension?.body}
      </p>
      <div className="sm:flex sm:justify-between">
        <div className="sm:flex">
          <p className="flex items-center text-sm text-gray-500">
            <HandRaisedIcon
              className="mr-1.5 h-4 w-4 shrink-0 text-gray-400"
              aria-hidden="true"
            />
            {props.proposal.authorship.author}
          </p>
          <p className="mt-2 flex items-center truncate text-sm text-gray-500 sm:mt-0 sm:ml-4">
            <Square2StackIcon
              className="mr-1.5 h-4 w-4 shrink-0 text-gray-400"
              aria-hidden="true"
            />
            {props.proposal.options.join(', ')}
          </p>
        </div>
      </div>
    </Link>
  )
}
