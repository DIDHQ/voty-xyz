import dynamic from 'next/dynamic'
import { ReactNode, useId } from 'react'

const ReactTooltip = dynamic(
  () => import('react-tooltip').then(({ Tooltip }) => Tooltip),
  { ssr: false },
)

export default function Tooltip(props: {
  place: 'top' | 'right' | 'bottom' | 'left'
  children: ReactNode
  text: string
  className?: string
}) {
  const id = useId()

  return (
    <>
      <div
        data-tooltip-id={id}
        data-tooltip-place={props.place}
        className={props.className}
      >
        {props.children}
      </div>
      <ReactTooltip id={id} className="z-50 rounded-md">
        {props.text}
      </ReactTooltip>
    </>
  )
}
