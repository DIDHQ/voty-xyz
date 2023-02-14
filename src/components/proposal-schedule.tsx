import useStatus from '../hooks/use-status'
import { Group } from '../utils/schemas'
import { DetailList, DetailItem } from './basic/detail'

export default function ProposalSchedule(props: {
  proposal?: string
  duration: Group['duration']
}) {
  const { data: status } = useStatus(props.proposal)
  return (
    <DetailList title="Schedule">
      <DetailItem title="Start">
        {status?.timestamp
          ? new Date(
              (status.timestamp + props.duration.announcement) * 1000,
            ).toLocaleString([], { hour12: false })
          : '-'}
      </DetailItem>
      <DetailItem title="End">
        {status?.timestamp
          ? new Date(
              (status.timestamp +
                props.duration.announcement +
                (props.duration.adding_option || 0) +
                props.duration.voting) *
                1000,
            ).toLocaleString([], { hour12: false })
          : '-'}
      </DetailItem>
    </DetailList>
  )
}
