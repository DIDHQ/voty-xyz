import useStatus from '../hooks/use-status'
import { Workgroup } from '../utils/schemas/workgroup'
import { formatTime } from '../utils/time'
import { DetailList, DetailItem } from './basic/detail'
import ProposalPeriod from './proposal-period'

export default function ProposalSchedule(props: {
  proposal?: string
  duration?: Workgroup['duration']
}) {
  const { data: status } = useStatus(props.proposal)

  return (
    <DetailList title="Schedule">
      <DetailItem title="Period" className="overflow-y-visible">
        <ProposalPeriod
          proposal={props.proposal}
          duration={props.duration}
          className="my-[-3px] translate-y-[-1px]"
        />
      </DetailItem>
      <DetailItem title="Start">
        {status?.timestamp && props.duration
          ? formatTime(
              status.timestamp.getTime() + props.duration.announcement * 1000,
            )
          : '...'}
      </DetailItem>
      <DetailItem title="End">
        {status?.timestamp && props.duration
          ? formatTime(
              status.timestamp.getTime() +
                (props.duration.announcement +
                  (props.duration.adding_option || 0) +
                  props.duration.voting) *
                  1000,
            )
          : '...'}
      </DetailItem>
    </DetailList>
  )
}
