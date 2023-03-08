import { CubeIcon, CubeTransparentIcon } from '@heroicons/react/24/outline'
import dynamic from 'next/dynamic'
import { useId, useMemo } from 'react'

import useStatus from '../hooks/use-status'
import { permalink2Explorer } from '../utils/permalink'
import TextButton from './basic/text-button'

const Tooltip = dynamic(
  () => import('react-tooltip').then(({ Tooltip }) => Tooltip),
  { ssr: false },
)

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
  const id = useId()

  return props.permalink ? (
    <>
      <a
        href={permalink2Explorer(props.permalink)}
        data-tooltip-id={id}
        data-tooltip-place="left"
        className={props.className}
      >
        <TextButton primary className="w-full truncate">
          {children}
        </TextButton>
      </a>
      <Tooltip id={id} className="rounded">
        Transaction {status?.timestamp ? 'confirmed' : 'pending'}
      </Tooltip>
    </>
  ) : null
}
