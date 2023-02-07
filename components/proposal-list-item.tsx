import {
  CalendarIcon,
  RectangleStackIcon,
  UserIcon,
} from '@heroicons/react/20/solid'
import Link from 'next/link'

import { Authorized, Proposal } from '../src/schemas'

export default function ProposalListItem(props: {
  entry: string
  value: Authorized<Proposal> & { uri: string }
}) {
  return (
    <Link
      href={`/${props.entry}/${props.value.group}/${encodeURIComponent(
        props.value.uri,
      )}`}
      className="block hover:bg-gray-100"
    >
      <div className="p-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="truncate text-sm font-medium text-indigo-600">
              {props.value.title}
            </p>
            <p>{props.value.extension?.body}</p>
          </div>
          <div className="ml-2 flex shrink-0">
            <p className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
              {props.value.voting_type}
            </p>
          </div>
        </div>
        <div className="mt-2 sm:flex sm:justify-between">
          <div className="sm:flex">
            <p className="flex items-center text-sm text-gray-500">
              <UserIcon
                className="mr-1.5 h-5 w-5 shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {props.value.author.did}
            </p>
            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
              <RectangleStackIcon
                className="mr-1.5 h-5 w-5 shrink-0 text-gray-400"
                aria-hidden="true"
              />
              {props.value.options.join(', ')}
            </p>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
            <CalendarIcon
              className="mr-1.5 h-5 w-5 shrink-0 text-gray-400"
              aria-hidden="true"
            />
            <p>
              Snapshot{' '}
              <time dateTime={props.value.author.snapshot}>
                {props.value.author.snapshot}
              </time>
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
