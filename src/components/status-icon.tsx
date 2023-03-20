import { CubeIcon, CubeTransparentIcon } from '@heroicons/react/24/outline'
import { useMemo } from 'react'

import useStatus from '../hooks/use-status'
import { permalink2Explorer } from '../utils/permalink'
import TextButton from './basic/text-button'
import Tooltip from './basic/tooltip'

export default function StatusIcon(props: {
  permalink?: string
  className?: string
}) {
  const { data: status, isLoading } = useStatus(props.permalink)
  const children = useMemo(
    () =>
      isLoading ? null : status?.timestamp ? (
        <CubeIcon className="h-5 w-5" />
      ) : (
        <CubeTransparentIcon className="h-5 w-5" />
      ),
    [isLoading, status?.timestamp],
  )

  return props.permalink ? (
    <Tooltip
      place="left"
      text={`Transaction ${status?.timestamp ? 'confirmed' : 'pending'}`}
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
