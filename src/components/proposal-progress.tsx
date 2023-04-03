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
      <DetailItem title="Created at">
        {status?.timestamp ? formatTime(status.timestamp) : '...'}
      </DetailItem>
      <DetailItem
        title={
          props.duration && 'adding_option' in props.duration
            ? 'Proposing start'
            : 'Voting start'
        }
      >
        {status?.timestamp && props.duration
          ? formatTime(
              status.timestamp.getTime() + props.duration.pending * 1000,
            )
          : '...'}
      </DetailItem>
      {props.duration && 'adding_option' in props.duration ? (
        <DetailItem title="Proposing end">
          {status?.timestamp && props.duration
            ? formatTime(
                status.timestamp.getTime() +
                  (props.duration.pending + props.duration.adding_option) *
                    1000,
              )
            : '...'}
        </DetailItem>
      ) : null}
      <DetailItem title="Voting end">
        {status?.timestamp && props.duration
          ? formatTime(
              status.timestamp.getTime() +
                (props.duration.pending +
                  ('adding_option' in props.duration
                    ? props.duration.adding_option
                    : 0) +
                  props.duration.voting) *
                  1000,
            )
          : '...'}
      </DetailItem>
    </DetailList>
  )
}
