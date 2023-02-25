import {
  BoltIcon,
  HandRaisedIcon,
  Square2StackIcon,
} from '@heroicons/react/20/solid'
import Link from 'next/link'

import useWorkgroup from '../hooks/use-workgroup'
import { permalink2Id } from '../utils/permalink'
import { Authorized } from '../utils/schemas/authorship'
import { Proposal } from '../utils/schemas/proposal'
import { trpc } from '../utils/trpc'
import ProposalPeriod from './proposal-period'

export default function ProposalListItem(props: {
  entry: string
  proposal: Authorized<Proposal> & { permalink: string; votes: number }
}) {
  const { data: community } = trpc.community.getByEntry.useQuery(
    { entry: props.entry },
    { refetchOnWindowFocus: false },
  )
  const workgroup = useWorkgroup(community, props.proposal.workgroup)

  return (
    <Link
      href={`/${props.entry}/${props.proposal.workgroup}/${permalink2Id(
        props.proposal.permalink,
      )}`}
      className="group block space-y-2 py-6 px-0"
    >
      <div className="flex w-full items-center justify-between">
        <p className="truncate font-medium text-primary-600 group-hover:underline group-focus:underline">
          {props.proposal.title}
        </p>
        <ProposalPeriod
          proposal={props.proposal.permalink}
          duration={workgroup?.duration}
          className="ml-4"
        />
      </div>
      {props.proposal.extension?.body ? (
        <p className="text-gray-600 line-clamp-3">
          {props.proposal.extension.body}
        </p>
      ) : null}
      <div className="flex w-full items-center justify-start">
        <HandRaisedIcon
          className="mr-1.5 h-4 w-4 shrink-0 text-gray-400"
          aria-hidden="true"
        />
        <p className="text-sm text-gray-500">
          {props.proposal.authorship.author}
        </p>
        <Square2StackIcon
          className="ml-4 mr-1.5 h-4 w-4 shrink-0 text-gray-400"
          aria-hidden="true"
        />
        <p className="truncate text-sm text-gray-500">
          {props.proposal.options.length}
        </p>
        <BoltIcon
          className="ml-4 mr-1.5 h-4 w-4 shrink-0 text-gray-400"
          aria-hidden="true"
        />
        <p className="text-sm text-gray-500">{props.proposal.votes}</p>
      </div>
    </Link>
  )
}
