import clsx from 'clsx'

import useGroup from '../hooks/use-group'
import {
  coinTypeExplorers,
  commonCoinTypes,
  previewPermalink,
} from '../utils/constants'
import { Option } from '../utils/schemas/option'
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
  option?: Option & {
    authorship?: { author?: string }
  }
  className?: string
}) {
  const { data: community } = trpc.community.getByPermalink.useQuery(
    { permalink: props.proposal?.community },
    { enabled: !!props.proposal?.community, refetchOnWindowFocus: false },
  )
  const group = useGroup(community, props.proposal?.group)

  return (
    <div
      className={clsx(
        'relative w-full shrink-0 sm:mt-8 sm:w-80',
        props.className,
      )}
    >
      <div className="space-y-6 rounded-md border border-gray-200 p-6">
        <ProposalProgress
          proposal={props.proposal?.permalink}
          duration={group?.duration}
        />
        {group?.extension.type === 'grant' ? (
          <DetailList title="Funding">
            <Article small className="pt-2">
              <ul>
                {props.proposal?.extension?.funding?.map((funding, index) => (
                  <li key={index}>
                    {funding[0]}&nbsp;
                    <span className="text-gray-400">X</span>&nbsp;
                    {funding[1]}
                  </li>
                ))}
              </ul>
            </Article>
          </DetailList>
        ) : (
          <DetailList title="Criteria for approval">
            <Article small className="pt-2">
              <Markdown>{group?.extension.criteria_for_approval}</Markdown>
            </Article>
          </DetailList>
        )}
        <DetailList title="Information">
          <DetailItem title="Community" className="truncate whitespace-nowrap">
            {community ? (
              <TextButton href={`/${community.authorship.author}`}>
                {community.name}
              </TextButton>
            ) : (
              '...'
            )}
          </DetailItem>
          <DetailItem
            title={
              group
                ? group.extension.type === 'grant'
                  ? 'Grant'
                  : 'Workgroup'
                : '...'
            }
            className="truncate whitespace-nowrap"
          >
            {group && community ? (
              <TextButton href={`/${community.authorship.author}/${group.id}`}>
                {group.name}
              </TextButton>
            ) : (
              '...'
            )}
          </DetailItem>
          <DetailItem
            title={
              group
                ? group.extension.type === 'grant'
                  ? 'Investor'
                  : 'Proposer'
                : '...'
            }
            className="truncate whitespace-nowrap"
          >
            {props.proposal?.authorship?.author || '...'}
          </DetailItem>
          {props.option ? (
            <DetailItem title="Proposer" className="truncate whitespace-nowrap">
              {props.option.authorship?.author}
            </DetailItem>
          ) : null}
        </DetailList>
        {props.proposal?.snapshots ? (
          <DetailList title="On-chain verification">
            <DetailItem title="Snapshot">
              <TextButton
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
                href={
                  props.proposal?.permalink === previewPermalink
                    ? undefined
                    : permalink2Explorer(props.proposal?.permalink)
                }
              >
                {props.proposal?.permalink.substring(40) || '...'}
              </TextButton>
            </DetailItem>
          </DetailList>
        ) : null}
      </div>
    </div>
  )
}
