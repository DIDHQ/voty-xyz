import clsx from 'clsx'

import {
  coinTypeExplorers,
  commonCoinTypes,
  previewPermalink,
} from '../utils/constants'
import { Community } from '../utils/schemas/community'
import { Grant } from '../utils/schemas/grant'
import { GrantProposal } from '../utils/schemas/grant-proposal'
import Article from './basic/article'
import { DetailItem, DetailList } from './basic/detail'
import TextButton from './basic/text-button'
import GrantProgress from './grant-progress'
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
      <GrantProgress
        grantPermalink={props.grantProposal?.grant}
        phase={props.grant?.duration}
      />
      <DetailList title="Grant package">
        <Article small className="pt-2">
          <ul>
            {props.grant?.funding?.map((funding, index) => (
              <li key={index}>
                {funding[0]}&nbsp;
                <span className="text-gray-400">X</span>&nbsp;
                {funding[1]}
              </li>
            ))}
          </ul>
        </Article>
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
        <DetailItem title="Grant" className="truncate whitespace-nowrap">
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
