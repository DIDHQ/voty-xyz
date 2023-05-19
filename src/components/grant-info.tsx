import clsx from 'clsx'

import {
  coinTypeExplorers,
  commonCoinTypes,
  previewPermalink,
} from '../utils/constants'
import { Community } from '../utils/schemas/v1/community'
import { Grant } from '../utils/schemas/v1/grant'
import { DetailItem, DetailList } from './basic/detail'
import TextLink from './basic/text-link'
import GrantCurrentPhase from './grant-current-phase'
import { PreviewPermalink } from '../utils/types'
import { permalink2Explorer } from '../utils/permalink'
import { formatNumber } from '../utils/number'
import Article from './basic/article'

export default function GrantInfo(props: {
  community?: Community
  grant?: Grant & {
    permalink: string | PreviewPermalink
    authorship?: { author?: string }
  }
  className?: string
}) {
  const disabled = props.grant?.permalink === previewPermalink

  return (
    <div
      className={clsx(
        'w-full shrink-0 space-y-6 sm:mt-8 sm:w-80',
        props.className,
      )}
    >
      <div className="w-full space-y-6 rounded-md border border-gray-200 p-6">
        <GrantCurrentPhase
          grantPermalink={props.grant?.permalink}
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
                className="truncate whitespace-nowrap"
              >
                {props.community.name}
              </TextLink>
            ) : (
              '...'
            )}
          </DetailItem>
        </DetailList>
        {props.grant?.snapshots ? (
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
                href={permalink2Explorer(props.grant?.permalink)}
              >
                {props.grant?.permalink.substring(40) || '...'}
              </TextLink>
            </DetailItem>
          </DetailList>
        ) : null}
      </div>
      <div className="w-full rounded-md border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900">How topic grant works:</h3>
        <Article small className="-ml-2">
          <ul>
            <li>
              Any member can submit a proposal to get grant package during the{' '}
              <span className="text-indigo-600">proposing</span> phase.
            </li>
            <li>
              Any member will vote on the best proposals during the{' '}
              <span className="text-lime-600">voting</span> phase.
            </li>
            <li>
              The top <b>{props.grant?.funding[0][1]}</b> proposal
              {props.grant?.funding[0][1] === 1 ? '' : 's'} will get{' '}
              <b>{props.grant?.funding[0][0]}</b> each at the end.
            </li>
          </ul>
        </Article>
      </div>
    </div>
  )
}
