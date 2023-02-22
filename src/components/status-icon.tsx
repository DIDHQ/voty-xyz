import { CubeIcon, CubeTransparentIcon } from '@heroicons/react/24/outline'
import dynamic from 'next/dynamic'
import { ReactNode, useId, useMemo } from 'react'

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
  children?: ReactNode
}) {
  const { data: status, isInitialLoading } = useStatus(props.permalink)
  const children = useMemo(
    () =>
      props.children ??
      (isInitialLoading ? null : status?.timestamp ? (
        <CubeIcon className="h-5 w-5" />
      ) : (
        <CubeTransparentIcon className="h-5 w-5" />
      )),
    [isInitialLoading, props.children, status?.timestamp],
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
        <TextButton>{children}</TextButton>
      </a>
      <Tooltip id={id} className="rounded-none">
        Transaction {status?.timestamp ? 'confirmed' : 'pending'}
      </Tooltip>
    </>
  ) : null
}
