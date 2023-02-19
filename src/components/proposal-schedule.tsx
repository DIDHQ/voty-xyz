import useStatus from '../hooks/use-status'
import { Workgroup } from '../utils/schemas/workgroup'
import { formatTime } from '../utils/time'
import { DetailList, DetailItem } from './basic/detail'
import ProposalPeriod from './proposal-period'

export default function ProposalSchedule(props: {
  proposal?: string
  duration: Workgroup['duration']
}) {
  const { data: status } = useStatus(props.proposal)

  return (
    <DetailList title="Schedule">
      <DetailItem title="Period">
        <ProposalPeriod
          proposal={props.proposal}
          duration={props.duration}
          className="my-[-2px]"
        />
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
