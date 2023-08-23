import { useMemo } from 'react'

import { GroupProposalPhase } from '../utils/phase'
import { permalink2Id } from '../utils/permalink'
import { Authorized } from '../utils/schemas/basic/authorship'
import { GroupProposal } from '../utils/schemas/v1/group-proposal'
import { formatDurationMs } from '../utils/time'
import useNow from '../hooks/use-now'
import { formatDid } from '../utils/did/utils'
import { InfoCard, InfoItem } from './info-card'

export default function GroupProposalCard(props: {
  groupProposal: Authorized<GroupProposal> & {
    image?: string
    permalink: string
    communityId: string
    groupId: string
    votes: number
    ts: Date
    tsAnnouncing: Date | null
    tsVoting: Date | null
  }
}) {
  const now = useNow()
  const phase = useMemo(
    () =>
      props.groupProposal.tsAnnouncing && props.groupProposal.tsVoting
        ? now.getTime() < props.groupProposal.tsAnnouncing.getTime()
          ? GroupProposalPhase.ANNOUNCING
          : now.getTime() < props.groupProposal.tsVoting.getTime()
          ? GroupProposalPhase.VOTING
          : GroupProposalPhase.ENDED
        : GroupProposalPhase.CONFIRMING,
    [props.groupProposal.tsAnnouncing, props.groupProposal.tsVoting, now],
  )

  return (
    <InfoCard
      desc={props.groupProposal.content}
      href={`/group-proposal/${permalink2Id(props.groupProposal.permalink)}`}
      thumbnail={props.groupProposal.image}
      title={props.groupProposal.title}>
      <InfoItem
        label="Proposer"
        value={formatDid(props.groupProposal.authorship.author)} />
        
      {phase === GroupProposalPhase.CONFIRMING ? (
        <InfoItem
        label="Transaction confirming"
        phaseColor="yellow"
        value="in about 5 minutes" />
      ) : phase === GroupProposalPhase.ANNOUNCING && props.groupProposal.tsAnnouncing ? (
        <InfoItem
          label="Voting starts"
          phaseColor="blue"
          value={'in ' + formatDurationMs(props.groupProposal.tsAnnouncing.getTime() - now.getTime())} />
      ) : phase === GroupProposalPhase.VOTING && props.groupProposal.tsVoting ? (
        <InfoItem
          label="Voting ends"
          phaseColor="green"
          value={'in ' + formatDurationMs(props.groupProposal.tsVoting.getTime() - now.getTime())} />
      ) : phase === GroupProposalPhase.ENDED && props.groupProposal.tsVoting ? (
        <InfoItem
          label="Voting ended"
          phaseColor="gray"
          value={formatDurationMs(props.groupProposal.tsVoting.getTime() - now.getTime()) + ' ago'} />
      ) : null}
        
      <InfoItem
        className="hidden sm:block"
        label="Votes"
        value={props.groupProposal.votes} />
    </InfoCard>
  )
}
