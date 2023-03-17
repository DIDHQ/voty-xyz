import Link from 'next/link'
import { useMemo } from 'react'

import { permalink2Id } from '../utils/permalink'
import { Authorized } from '../utils/schemas/authorship'
import { Option } from '../utils/schemas/option'
import { formatDurationMs } from '../utils/time'

export default function OptionCard(props: {
  option: Authorized<Option> & {
    permalink: string
    power: string
    ts: Date
  }
}) {
  const now = useMemo(() => Date.now(), [])

  return (
    <Link
      shallow
      href={`/round/${permalink2Id(props.option.proposal)}/${permalink2Id(
        props.option.permalink,
      )}`}
      className="block divide-y rounded-md border transition-colors focus-within:ring-2 focus-within:ring-primary-300 hover:border-primary-500 hover:bg-gray-50"
    >
      <div className="w-full p-4">
        <p className="truncate text-lg font-medium text-gray-800">
          {props.option.title}
        </p>
        {props.option.extension?.content ? (
          <p className="text-gray-600 line-clamp-3">
            {props.option.extension.content}
          </p>
        ) : null}
      </div>
      <div className="flex w-full divide-x bg-gray-50 text-sm">
        <div className="w-0 flex-1 px-4 py-2">
          <p>Proposer</p>
          <p className="truncate text-gray-400">
            {props.option.authorship.author}
          </p>
        </div>
        <div className="w-0 flex-1 px-4 py-2">
          <p className="truncate">Created</p>
          <p className="truncate text-gray-400">
            {formatDurationMs(props.option.ts.getTime() - now)}
            &nbsp;ago
          </p>
        </div>
        <div className="hidden w-0 flex-1 px-4 py-2 sm:block">
          <p>Power</p>
          <p className="text-gray-400">{props.option.power}</p>
        </div>
      </div>
    </Link>
  )
}
