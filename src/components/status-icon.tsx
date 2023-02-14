import { CubeIcon, CubeTransparentIcon } from '@heroicons/react/24/outline'
import { useMemo } from 'react'

import useStatus from '../hooks/use-status'
import { permalink2Url } from '../utils/permalink'
import TextButton from './basic/text-button'

export default function StatusIcon(props: { permalink?: string }) {
  const { data: status } = useStatus(props.permalink)
  const icon = useMemo(
    () =>
      status?.timestamp ? (
        <CubeIcon className="h-5 w-5" />
      ) : (
        <CubeTransparentIcon className="h-5 w-5" />
      ),
    [status?.timestamp],
  )

  return props.permalink ? (
    <a href={permalink2Url(props.permalink)}>
      <TextButton>{icon}</TextButton>
    </a>
  ) : (
    <TextButton>{icon}</TextButton>
  )
}
