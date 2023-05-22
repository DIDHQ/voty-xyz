import clsx from 'clsx'

import {
  coinTypeExplorers,
  commonCoinTypes,
  previewPermalink,
} from '../utils/constants'
import { Community } from '../utils/schemas/v1/community'
import { Group } from '../utils/schemas/v1/group'
import { GroupProposal } from '../utils/schemas/v1/group-proposal'
import Article from './basic/article'
import { DetailItem, DetailList } from './basic/detail'
import MarkdownViewer from './basic/markdown-viewer'
import TextLink from './basic/text-link'
import GroupProposalCurrentPhase from './group-proposal-current-phase'
import { PreviewPermalink } from '../utils/types'
import { permalink2Explorer } from '../utils/permalink'
import { formatNumber } from '../utils/number'

export default function GroupProposalInfo(props: {
  community?: Community
  group?: Group
  groupProposal?: GroupProposal & {
    permalink: string | PreviewPermalink
    authorship?: { author?: string }
  }
  className?: string
}) {
  const disabled = props.groupProposal?.permalink === previewPermalink

  return (
    <div
      className={clsx(
        'w-full shrink-0 space-y-6 rounded-md border border-gray-200 p-6 sm:mt-8 sm:w-80',
        props.className,
      )}
    >
      <GroupProposalCurrentPhase
        groupProposalPermalink={props.groupProposal?.permalink}
        duration={props.group?.duration}
      />
      <DetailList title="Criteria for approval">
        <Article small className="pt-2">
          <MarkdownViewer>{props.group?.terms_and_conditions}</MarkdownViewer>
        </Article>
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
        <DetailItem title="Workgroup">
          {props.group && props.community ? (
            <TextLink
              underline
              disabled={disabled}
              href={`/${props.community.id}/group/${props.group.id}`}
              className="truncate whitespace-nowrap"
            >
              {props.group.name}
            </TextLink>
          ) : (
            '...'
          )}
        </DetailItem>
        <DetailItem title="Proposer" className="truncate whitespace-nowrap">
          {props.groupProposal?.authorship?.author || '...'}
        </DetailItem>
      </DetailList>
      {props.groupProposal?.snapshots ? (
        <DetailList title="On-chain verification">
          <DetailItem title="Snapshot">
            <TextLink
              underline
              disabled={disabled}
              href={`${coinTypeExplorers[commonCoinTypes.CKB]}${
                props.groupProposal.snapshots[commonCoinTypes.CKB]
              }`}
            >
              {formatNumber(
                parseInt(
                  props.groupProposal.snapshots[commonCoinTypes.CKB],
                  10,
                ),
              )}
            </TextLink>
          </DetailItem>
          <DetailItem title="Arweave TX">
            <TextLink
              underline
              disabled={disabled}
              href={permalink2Explorer(props.groupProposal?.permalink)}
            >
              {props.groupProposal?.permalink.substring(40) || '...'}
            </TextLink>
          </DetailItem>
        </DetailList>
      ) : null}
    </div>
  )
}
