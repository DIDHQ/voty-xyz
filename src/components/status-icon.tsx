import { useMemo } from 'react'
import clsx from 'clsx'

import useStatus from '../hooks/use-status'
import { permalink2Explorer } from '../utils/permalink'
import TextButton from './basic/text-button'
import Tooltip from './basic/tooltip'
import { PreviewPermalink } from '../utils/types'
import { ArweaveIcon } from './icons'

export default function StatusIcon(props: {
  permalink?: string | PreviewPermalink
  className?: string
}) {
  const { data: status, isLoading } = useStatus(props.permalink)
  const children = useMemo(
    () => (
      <ArweaveIcon
        className={clsx(
          'h-5 w-5',
          isLoading
            ? null
            : status?.timestamp
            ? 'text-primary-600'
            : 'text-slate-600',
        )}
      />
    ),
    [isLoading, status?.timestamp],
  )

  return props.permalink ? (
    <Tooltip
      place="top"
      text={`Transaction ${status?.timestamp ? 'confirmed' : 'confirming'}`}
      className={props.className}
    >
      <TextButton
        primary
        href={permalink2Explorer(props.permalink)}
        className="w-full truncate"
      >
        {children}
      </TextButton>
    </Tooltip>
  ) : null
}
