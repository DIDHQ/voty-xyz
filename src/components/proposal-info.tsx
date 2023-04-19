import clsx from 'clsx'

import useGroup from '../hooks/use-group'
import {
  coinTypeExplorers,
  commonCoinTypes,
  previewPermalink,
} from '../utils/constants'
import { Proposal } from '../utils/schemas/proposal'
import { trpc } from '../utils/trpc'
import Article from './basic/article'
import { DetailItem, DetailList } from './basic/detail'
import Markdown from './basic/markdown'
import TextButton from './basic/text-button'
import ProposalProgress from './proposal-progress'
import { PreviewPermalink } from '../utils/types'
import { permalink2Explorer } from '../utils/permalink'
import { formatNumber } from '../utils/number'

export default function ProposalInfo(props: {
  proposal?: Proposal & {
    permalink: string | PreviewPermalink
    authorship?: { author?: string }
  }
  className?: string
}) {
  const { data: community } = trpc.community.getByPermalink.useQuery(
    { permalink: props.proposal?.community },
    { enabled: !!props.proposal?.community, refetchOnWindowFocus: false },
  )
  const group = useGroup(community, props.proposal?.group)
  const disabled = props.proposal?.permalink === previewPermalink

  return (
    <div
      className={clsx(
        'w-full shrink-0 space-y-6 rounded-md border border-gray-200 p-6 sm:mt-8 sm:w-80',
        props.className,
      )}
    >
      <ProposalProgress
        proposal={props.proposal?.permalink}
        phase={group?.duration}
      />
      <DetailList title="Criteria for approval">
        <Article small className="pt-2">
          <Markdown>{group?.extension.terms_and_conditions}</Markdown>
        </Article>
      </DetailList>
      <DetailList title="Information">
        <DetailItem title="Community" className="truncate whitespace-nowrap">
          {community ? (
            <TextButton
              underline
              disabled={disabled}
              href={`/${community.authorship.author}`}
            >
              {community.name}
            </TextButton>
          ) : (
            '...'
          )}
        </DetailItem>
        <DetailItem title="Workgroup" className="truncate whitespace-nowrap">
          {group && community ? (
            <TextButton
              underline
              disabled={disabled}
              href={`/${community.authorship.author}/${group.id}`}
            >
              {group.name}
            </TextButton>
          ) : (
            '...'
          )}
        </DetailItem>
        <DetailItem title="Proposer" className="truncate whitespace-nowrap">
          {props.proposal?.authorship?.author || '...'}
        </DetailItem>
      </DetailList>
      {props.proposal?.snapshots ? (
        <DetailList title="On-chain verification">
          <DetailItem title="Snapshot">
            <TextButton
              underline
              disabled={disabled}
              href={`${coinTypeExplorers[commonCoinTypes.CKB]}${
                props.proposal.snapshots[commonCoinTypes.CKB]
              }`}
            >
              {formatNumber(
                parseInt(props.proposal.snapshots[commonCoinTypes.CKB], 10),
              )}
            </TextButton>
          </DetailItem>
          <DetailItem title="Arweave TX">
            <TextButton
              underline
              disabled={disabled}
              href={permalink2Explorer(props.proposal?.permalink)}
            >
              {props.proposal?.permalink.substring(40) || '...'}
            </TextButton>
          </DetailItem>
        </DetailList>
      ) : null}
    </div>
  )
}
