import { clsx } from 'clsx'

import {
  coinTypeExplorers,
  commonCoinTypes,
  previewPermalink,
} from '../utils/constants'
import { Community } from '../utils/schemas/v1/community'
import { Grant } from '../utils/schemas/v1/grant'
import { GrantProposal } from '../utils/schemas/v1/grant-proposal'
import { PreviewPermalink } from '../utils/types'
import { formatNumber } from '../utils/number'
import { permalink2Explorer, permalink2Id } from '../utils/permalink'
import { formatDid } from '../utils/did/utils'
import { trpc } from '../utils/trpc'
import { formatTime } from '../utils/time'
import GrantCurrentPhase from './grant-current-phase'
import TextLink from './basic/text-link'
import { DetailItem, DetailList } from './basic/detail'

export default function GrantProposalInfo(props: {
  community?: Omit<Community, 'logo'>
  grant?: Grant
  grantProposal?: GrantProposal & {
    ts: Date
    selected: string | null
    permalink: string | PreviewPermalink
    authorship?: { author?: string }
  }
  className?: string
}) {
  const disabled = props.grantProposal?.permalink === previewPermalink
  const { data: grantProposalSelect } =
    trpc.grantProposalSelect.getByPermalink.useQuery(
      { permalink: props.grantProposal?.selected || undefined },
      {
        enabled:
          !!props.grantProposal?.selected &&
          !!props.grant?.permission.selecting,
      },
    )

  return (
    <div
      className={clsx(
        'w-full shrink-0 space-y-6 rounded-md border border-gray-200 p-6 sm:mt-8 sm:w-80',
        props.className,
      )}
    >
      <GrantCurrentPhase
        grantPermalink={props.grantProposal?.grant}
        duration={props.grant?.duration}
      />
      <DetailList title="Grant package">
        <p className="py-2 text-sm font-medium text-gray-600">
          {props.grant?.funding[0] ? (
            <>
              {props.grant.funding[0][0]}{' '}
              <span className="text-gray-400">✕</span>{' '}
              {props.grant.funding[0][1]}
            </>
          ) : (
            '...'
          )}
        </p>
      </DetailList>
      <DetailList title="Information">
        <DetailItem title="Community">
          {props.community ? (
            <TextLink
              underline
              disabled={disabled}
              href={`/${props.community.id}`}
              className="block truncate whitespace-nowrap"
            >
              {props.community.name}
            </TextLink>
          ) : (
            '...'
          )}
        </DetailItem>
        <DetailItem title="Topic Grant">
          {props.community && props.grant && props.grantProposal ? (
            <TextLink
              underline
              disabled={disabled}
              href={`/${props.community.id}/grant/${permalink2Id(
                props.grantProposal.grant,
              )}`}
              className="block truncate whitespace-nowrap"
            >
              {props.grant.name}
            </TextLink>
          ) : (
            '...'
          )}
        </DetailItem>
        <DetailItem
          title="Proposer"
          className="block truncate whitespace-nowrap"
        >
          {props.grantProposal?.authorship?.author
            ? formatDid(props.grantProposal.authorship.author)
            : '...'}
        </DetailItem>
        <DetailItem
          title="Proposed at"
          className="block truncate whitespace-nowrap"
        >
          {props.grantProposal?.ts ? formatTime(props.grantProposal.ts) : '...'}
        </DetailItem>
        {grantProposalSelect ? (
          <DetailItem
            title="Selected by"
            className="block truncate whitespace-nowrap"
          >
            {grantProposalSelect?.authorship?.author
              ? formatDid(grantProposalSelect.authorship.author)
              : '...'}
          </DetailItem>
        ) : null}
      </DetailList>
      {props.grant?.snapshots && props.grantProposal ? (
        <DetailList title="On-chain verification">
          <DetailItem title="Snapshot">
            <TextLink
              underline
              disabled={disabled}
              href={`${coinTypeExplorers[commonCoinTypes.CKB]}${
                props.grant.snapshots[commonCoinTypes.CKB]
              }`}
            >
              {formatNumber(
                parseInt(props.grant.snapshots[commonCoinTypes.CKB], 10),
              )}
            </TextLink>
          </DetailItem>
          <DetailItem title="Arweave TX">
            <TextLink
              underline
              disabled={disabled}
              href={permalink2Explorer(props.grantProposal.permalink)}
            >
              {props.grantProposal?.permalink.substring(40) || '...'}
            </TextLink>
          </DetailItem>
        </DetailList>
      ) : null}
    </div>
  )
}
