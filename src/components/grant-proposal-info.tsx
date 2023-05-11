import clsx from 'clsx'

import {
  coinTypeExplorers,
  commonCoinTypes,
  previewPermalink,
} from '../utils/constants'
import { Community } from '../utils/schemas/v1/community'
import { Grant } from '../utils/schemas/v1/grant'
import { GrantProposal } from '../utils/schemas/v1/grant-proposal'
import { DetailItem, DetailList } from './basic/detail'
import TextButton from './basic/text-button'
import GrantCurrentPhase from './grant-current-phase'
import { PreviewPermalink } from '../utils/types'
import { formatNumber } from '../utils/number'
import { permalink2Explorer, permalink2Id } from '../utils/permalink'

export default function GrantProposalInfo(props: {
  community?: Community
  grant?: Grant
  grantProposal?: GrantProposal & {
    permalink: string | PreviewPermalink
    authorship?: { author?: string }
  }
  className?: string
}) {
  const disabled = props.grantProposal?.permalink === previewPermalink

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
        <DetailItem title="Community" className="truncate whitespace-nowrap">
          {props.community ? (
            <TextButton
              underline
              disabled={disabled}
              href={`/${props.community.id}`}
            >
              {props.community.name}
            </TextButton>
          ) : (
            '...'
          )}
        </DetailItem>
        <DetailItem title="Topic grant" className="truncate whitespace-nowrap">
          {props.community && props.grant && props.grantProposal ? (
            <TextButton
              underline
              disabled={disabled}
              href={`/${props.community.id}/grant/${permalink2Id(
                props.grantProposal.grant,
              )}`}
            >
              {props.grant.name}
            </TextButton>
          ) : (
            '...'
          )}
        </DetailItem>
        <DetailItem title="Proposer" className="truncate whitespace-nowrap">
          {props.grantProposal?.authorship?.author || '...'}
        </DetailItem>
      </DetailList>
      {props.grant?.snapshots && props.grantProposal ? (
        <DetailList title="On-chain verification">
          <DetailItem title="Snapshot">
            <TextButton
              underline
              disabled={disabled}
              href={`${coinTypeExplorers[commonCoinTypes.CKB]}${
                props.grant.snapshots[commonCoinTypes.CKB]
              }`}
            >
              {formatNumber(
                parseInt(props.grant.snapshots[commonCoinTypes.CKB], 10),
              )}
            </TextButton>
          </DetailItem>
          <DetailItem title="Arweave TX">
            <TextButton
              underline
              disabled={disabled}
              href={permalink2Explorer(props.grantProposal.permalink)}
            >
              {props.grantProposal?.permalink.substring(40) || '...'}
            </TextButton>
          </DetailItem>
        </DetailList>
      ) : null}
    </div>
  )
}
