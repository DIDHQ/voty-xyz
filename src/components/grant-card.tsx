import { useMemo } from 'react'

import { GrantPhase } from '../utils/phase'
import { permalink2Id } from '../utils/permalink'
import { Authorized } from '../utils/schemas/basic/authorship'
import { Grant } from '../utils/schemas/v1/grant'
import { formatDurationMs } from '../utils/time'
import useNow from '../hooks/use-now'
import { formatDid } from '../utils/did/utils'
import { InfoCard, InfoItem } from './info-card'

export default function GrantCard(props: {
  communityId: string
  grant: Authorized<Grant> & {
    image?: string
    permalink: string
    proposals: number
    ts: Date
    tsAnnouncing: Date | null
    tsProposing: Date | null
    tsVoting: Date | null
  }
}) {
  const now = useNow()
  const phase = useMemo(
    () =>
      props.grant.tsAnnouncing &&
      props.grant.tsProposing &&
      props.grant.tsVoting
        ? now.getTime() < props.grant.tsAnnouncing.getTime()
          ? GrantPhase.ANNOUNCING
          : now.getTime() < props.grant.tsProposing.getTime()
          ? GrantPhase.PROPOSING
          : now.getTime() < props.grant.tsVoting.getTime()
          ? GrantPhase.VOTING
          : GrantPhase.ENDED
        : GrantPhase.CONFIRMING,
    [
      props.grant.tsAnnouncing,
      props.grant.tsProposing,
      props.grant.tsVoting,
      now,
    ],
  )

  return (
    <InfoCard
      desc={props.grant.introduction}
      href={`/${formatDid(props.communityId)}/grant/${permalink2Id(
        props.grant.permalink,
      )}`}
      thumbnail={props.grant.image}
      title={props.grant.name}
    >
      <InfoItem
        hightlight
        label="Grant package"
        value={
          props.grant.funding[0]?.[0] + ' x ' + props.grant.funding[0]?.[1]
        }
      />

      {phase === GrantPhase.CONFIRMING ? (
        <InfoItem
          label="Transaction confirming"
          phaseColor="yellow"
          value="in about 5 minutes"
        />
      ) : phase === GrantPhase.ANNOUNCING && props.grant.tsAnnouncing ? (
        <InfoItem
          label="Proposing starts"
          phaseColor="blue"
          value={
            'in ' +
            formatDurationMs(props.grant.tsAnnouncing.getTime() - now.getTime())
          }
        />
      ) : phase === GrantPhase.PROPOSING && props.grant.tsProposing ? (
        <InfoItem
          label="Proposing ends"
          phaseColor="purple"
          value={
            'in ' +
            formatDurationMs(props.grant.tsProposing.getTime() - now.getTime())
          }
        />
      ) : phase === GrantPhase.VOTING && props.grant.tsVoting ? (
        <InfoItem
          label="Voting ends"
          phaseColor="green"
          value={
            'in ' +
            formatDurationMs(props.grant.tsVoting.getTime() - now.getTime())
          }
        />
      ) : phase === GrantPhase.ENDED && props.grant.tsVoting ? (
        <InfoItem
          label="Voting ended"
          phaseColor="gray"
          value={
            formatDurationMs(props.grant.tsVoting.getTime() - now.getTime()) +
            ' ago'
          }
        />
      ) : null}

      <InfoItem
        className="hidden min-[802px]:block"
        label="Proposals"
        value={props.grant.proposals}
      />
    </InfoCard>
  )
}
