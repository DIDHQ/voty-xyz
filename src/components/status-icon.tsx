import { CubeIcon, CubeTransparentIcon } from '@heroicons/react/24/outline'
import dynamic from 'next/dynamic'
import { useId, useMemo } from 'react'

import useStatus from '../hooks/use-status'
import { permalink2Explorer, permalink2Url } from '../utils/permalink'
import TextButton from './basic/text-button'

const Tooltip = dynamic(
  () => import('react-tooltip').then(({ Tooltip }) => Tooltip),
  { ssr: false },
)

export default function StatusIcon(props: {
  permalink?: string
  className?: string
}) {
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
  const href = useMemo(
    () =>
      props.permalink
        ? status?.timestamp
          ? permalink2Explorer(props.permalink)
          : permalink2Url(props.permalink)
        : undefined,
    [props.permalink, status?.timestamp],
  )
  const id = useId()

  return props.permalink ? (
    <>
      <a
        href={href}
        data-tooltip-id={id}
        data-tooltip-place="left"
        className={props.className}
      >
        <TextButton>{icon}</TextButton>
      </a>
      <Tooltip id={id}>
        Transaction {status?.timestamp ? 'confirmed' : 'pending'}
      </Tooltip>
    </>
  ) : null
}
