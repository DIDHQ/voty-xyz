import {
  coinTypeExplorers,
  commonCoinTypes,
  previewPermalink,
} from '../utils/constants'
import { Community } from '../utils/schemas/v1/community'
import { Group } from '../utils/schemas/v1/group'
import { GroupProposal } from '../utils/schemas/v1/group-proposal'
import { PreviewPermalink } from '../utils/types'
import { permalink2Explorer } from '../utils/permalink'
import { formatNumber } from '../utils/number'
import { formatDid } from '../utils/did/utils'
import Article from './basic/article'
import { DetailItem } from './basic/detail'
import MarkdownViewer from './basic/markdown-viewer'
import TextLink from './basic/text-link'
import GroupProposalCurrentPhase from './group-proposal-current-phase'
import Card from './basic/card'

export default function GroupProposalInfo(props: {
  community?: Omit<Community, 'logo'>
  group?: Group
  groupProposal?: GroupProposal & {
    permalink: string | PreviewPermalink
    authorship?: { author?: string }
  }
  className?: string
}) {
  const disabled = props.groupProposal?.permalink === previewPermalink

  return (
    <div className={props.className}>
      <GroupProposalCurrentPhase
        groupProposalPermalink={props.groupProposal?.permalink}
        duration={props.group?.duration}
      />

      <Card title="Criteria for approval">
        <Article small className="pt-2">
          <MarkdownViewer>{props.group?.criteria_for_approval}</MarkdownViewer>
        </Article>
      </Card>

      <Card title="Information">
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

        <DetailItem title="Workgroup">
          {props.group && props.community ? (
            <TextLink
              underline
              disabled={disabled}
              href={`/${props.community.id}/group/${props.group.id}`}
              className="block truncate whitespace-nowrap"
            >
              {props.group.name}
            </TextLink>
          ) : (
            '...'
          )}
        </DetailItem>

        <DetailItem
          title="Proposer"
          className="block truncate whitespace-nowrap"
        >
          {props.groupProposal?.authorship?.author
            ? formatDid(props.groupProposal.authorship.author)
            : '...'}
        </DetailItem>
      </Card>

      {props.groupProposal?.snapshots ? (
        <Card title="On-chain verification">
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
                  props.groupProposal.snapshots[commonCoinTypes.CKB] || '0',
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
        </Card>
      ) : null}
    </div>
  )
}
