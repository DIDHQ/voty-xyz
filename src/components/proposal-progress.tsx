import useStatus from '../hooks/use-status'
import { Group } from '../utils/schemas/group'
import { formatTime } from '../utils/time'
import { DetailList, DetailItem } from './basic/detail'
import ProposalPhaseText from './proposal-phase-text'

export default function ProposalProgress(props: {
  proposal?: string
  duration?: Group['duration']
}) {
  const { data: status } = useStatus(props.proposal)

  return (
    <DetailList title="Progress">
      <DetailItem title="Current phase" className="overflow-y-visible">
        <ProposalPhaseText
          proposal={props.proposal}
          duration={props.duration}
        />
      </DetailItem>
      <DetailItem title="Confirmed at">
        {status?.timestamp ? formatTime(status.timestamp) : '...'}
      </DetailItem>
      <DetailItem title="Voting start">
        {status?.timestamp && props.duration
          ? formatTime(
              status.timestamp.getTime() + props.duration.announcing * 1000,
            )
          : '...'}
      </DetailItem>
      <DetailItem title="Voting end">
        {status?.timestamp && props.duration
          ? formatTime(
              status.timestamp.getTime() +
                (props.duration.announcing + props.duration.voting) * 1000,
            )
          : '...'}
      </DetailItem>
    </DetailList>
  )
}
