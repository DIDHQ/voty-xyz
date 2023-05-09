import useStatus from '../hooks/use-status'
import { Grant } from '../utils/schemas/v1/grant'
import { format2Time } from '../utils/time'
import { DetailList, DetailItem } from './basic/detail'
import GrantPhaseText from './grant-phase-text'

export default function GrantProgress(props: {
  grantPermalink?: string
  duration?: Grant['duration']
}) {
  const { data: status } = useStatus(props.grantPermalink)

  return (
    <DetailList title="Grant progress">
      <DetailItem title="Current phase" className="overflow-y-visible">
        <GrantPhaseText
          grantPermalink={props.grantPermalink}
          duration={props.duration}
        />
      </DetailItem>
      <DetailItem title="Proposing">
        {status?.timestamp && props.duration
          ? format2Time(
              status.timestamp.getTime() + props.duration.announcing * 1000,
              status.timestamp.getTime() +
                (props.duration.announcing + props.duration.proposing) * 1000,
            )
          : '...'}
      </DetailItem>
      <DetailItem title="Voting">
        {status?.timestamp && props.duration
          ? format2Time(
              status.timestamp.getTime() +
                (props.duration.announcing + props.duration.proposing) * 1000,
              status.timestamp.getTime() +
                (props.duration.announcing +
                  props.duration.proposing +
                  props.duration.voting) *
                  1000,
            )
          : '...'}
      </DetailItem>
    </DetailList>
  )
}
