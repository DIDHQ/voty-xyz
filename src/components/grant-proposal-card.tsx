import { clsx } from 'clsx'
import { permalink2Id } from '../utils/permalink'
import { Authorized } from '../utils/schemas/basic/authorship'
import { GrantProposal } from '../utils/schemas/v1/grant-proposal'
import { formatDurationMs } from '../utils/time'
import useNow from '../hooks/use-now'
import { formatDid } from '../utils/did/utils'
import { GrantPhase } from '../utils/phase'
import Tooltip from './basic/tooltip'
import { CrownIcon } from './icons'
import { InfoCard, InfoItem } from './info-card'
import Tag from './basic/tag'

export default function GrantProposalCard(props: {
  communityId: string
  phase: GrantPhase
  grantProposal: Authorized<GrantProposal> & {
    image?: string
    permalink: string
    votes: number
    ts: Date
    funding?: string
  }
}) {
  const now = useNow()

  return (
    <InfoCard
      className={clsx(
        props.grantProposal.funding ? 'hover:ring-amber-500' : '',
      )}
      badge={
        props.grantProposal.funding ? (
          <Tooltip
            place="top"
            text={`This proposal won ${props.grantProposal.funding}`}
          >
            <Tag
              className="transition-colors group-hover:bg-amber-100"
              color="highlight"
              round
              size="small"
            >
              <CrownIcon className="h-4 w-4" />
              WON
            </Tag>
          </Tooltip>
        ) : null
      }
      desc={props.grantProposal.content}
      href={`/grant-proposal/${permalink2Id(props.grantProposal.permalink)}`}
      thumbnail={props.grantProposal.image}
      title={props.grantProposal.title}
    >
      <InfoItem
        label="Proposer"
        value={formatDid(props.grantProposal.authorship.author)}
      />

      {props.phase === GrantPhase.VOTING || props.phase === GrantPhase.ENDED ? (
        <InfoItem label="Votes" value={props.grantProposal.votes} />
      ) : (
        <InfoItem
          label="Proposed at"
          value={
            formatDurationMs(props.grantProposal.ts.getTime() - now.getTime()) +
            ' ago'
          }
        />
      )}
    </InfoCard>
  )
}
