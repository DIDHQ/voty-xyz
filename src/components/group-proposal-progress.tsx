import useStatus from '../hooks/use-status'
import { Group } from '../utils/schemas/v1/group'
import { format2Time, formatTime } from '../utils/time'
import { DetailList, DetailItem } from './basic/detail'
import GroupProposalPhaseText from './group-proposal-phase-text'

export default function GroupProposalProgress(props: {
  groupProposalPermalink?: string
  phase?: Group['duration']
}) {
  const { data: status } = useStatus(props.groupProposalPermalink)

  return (
    <DetailList title="Proposal progress">
      <DetailItem title="Current phase" className="overflow-y-visible">
        <GroupProposalPhaseText
          groupProposalPermalink={props.groupProposalPermalink}
          phase={props.phase}
        />
      </DetailItem>
      <DetailItem title="Confirmed at">
        {status?.timestamp ? formatTime(status.timestamp) : '...'}
      </DetailItem>
      <DetailItem title="Voting">
        {status?.timestamp && props.phase
          ? format2Time(
              status.timestamp.getTime() + props.phase.announcing * 1000,
              status.timestamp.getTime() +
                (props.phase.announcing + props.phase.voting) * 1000,
            )
          : '...'}
      </DetailItem>
    </DetailList>
  )
}
