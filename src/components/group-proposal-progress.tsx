import useStatus from '../hooks/use-status'
import { Group } from '../utils/schemas/v1/group'
import { format2Time } from '../utils/time'
import { DetailList, DetailItem } from './basic/detail'
import GroupProposalPhaseText from './group-proposal-phase-text'

export default function GroupProposalProgress(props: {
  groupProposalPermalink?: string
  duration?: Group['duration']
}) {
  const { data: status } = useStatus(props.groupProposalPermalink)

  return (
    <DetailList title="Proposal progress">
      <DetailItem title="Current phase" className="overflow-y-visible">
        <GroupProposalPhaseText
          groupProposalPermalink={props.groupProposalPermalink}
          duration={props.duration}
        />
      </DetailItem>
      <DetailItem title="Voting">
        {status?.timestamp && props.duration
          ? format2Time(
              status.timestamp.getTime() + props.duration.announcing * 1000,
              status.timestamp.getTime() +
                (props.duration.announcing + props.duration.voting) * 1000,
            )
          : '...'}
      </DetailItem>
    </DetailList>
  )
}
