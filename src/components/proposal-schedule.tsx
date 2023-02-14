import useStatus from '../hooks/use-status'
import { getPeriod } from '../utils/duration'
import { Group } from '../utils/schemas'
import { formatTime } from '../utils/time'
import { DetailList, DetailItem } from './basic/detail'

export default function ProposalSchedule(props: {
  proposal?: string
  duration: Group['duration']
}) {
  const { data: status } = useStatus(props.proposal)
  return (
    <DetailList title="Schedule">
      <DetailItem title="Status">
        {status?.timestamp
          ? getPeriod(Date.now() / 1000, status?.timestamp, props.duration)
          : '-'}
      </DetailItem>
      <DetailItem title="Start">
        {status?.timestamp
          ? formatTime((status.timestamp + props.duration.announcement) * 1000)
          : '-'}
      </DetailItem>
      <DetailItem title="End">
        {status?.timestamp
          ? formatTime(
              (status.timestamp +
                props.duration.announcement +
                (props.duration.adding_option || 0) +
                props.duration.voting) *
                1000,
            )
          : '-'}
      </DetailItem>
    </DetailList>
  )
}
