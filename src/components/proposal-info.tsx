import clsx from 'clsx'
import dynamic from 'next/dynamic'

import useGroup from '../hooks/use-group'
import { coinTypeExplorers, coinTypeNames } from '../utils/constants'
import { Authorized } from '../utils/schemas/authorship'
import { Proposal } from '../utils/schemas/proposal'
import { trpc } from '../utils/trpc'
import Article from './basic/article'
import { DetailItem, DetailList } from './basic/detail'
import Markdown from './basic/markdown'
import TextButton from './basic/text-button'
import ProposalSchedule from './proposal-schedule'

const StatusIcon = dynamic(() => import('./status-icon'), { ssr: false })

export default function ProposalInfo(props: {
  proposal?: Authorized<Proposal> & { permalink: string }
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
        'relative mt-[-1px] w-full shrink-0 sm:sticky sm:top-18 sm:w-80 sm:pt-8',
        props.className,
      )}
    >
      <StatusIcon
        permalink={props.proposal?.permalink}
        className="absolute right-4 top-4 sm:top-12"
      />
      <div className="space-y-6 rounded border border-gray-200 p-6">
        <DetailList title="Information">
          <DetailItem title="Community" className="truncate whitespace-nowrap">
            {community?.name || '...'}
          </DetailItem>
          <DetailItem
            title={group?.extension.type === 'grant' ? 'Grant' : 'Workgroup'}
            className="truncate whitespace-nowrap"
          >
            {group?.name || '...'}
          </DetailItem>
          <DetailItem
            title={group?.extension.type === 'grant' ? 'Investor' : 'Proposer'}
            className="truncate whitespace-nowrap"
          >
            {props.proposal?.authorship.author || '...'}
          </DetailItem>
        </DetailList>
        <ProposalSchedule
          proposal={props.proposal?.permalink}
          duration={group?.duration}
        />
        {props.proposal?.snapshots ? (
          <DetailList title="Snapshots">
            {Object.entries(props.proposal.snapshots).map(
              ([coinType, snapshot]) => (
                <DetailItem
                  key={coinType}
                  title={coinTypeNames[parseInt(coinType)] || coinType}
                >
                  <TextButton
                    href={`${coinTypeExplorers[parseInt(coinType)]}${snapshot}`}
                  >
                    {snapshot}
                  </TextButton>
                </DetailItem>
              ),
            )}
          </DetailList>
        ) : null}
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
          <DetailList title="Terms and conditions">
            <Article small className="pt-2">
              <Markdown>{group?.extension.terms_and_conditions}</Markdown>
            </Article>
          </DetailList>
        )}
      </div>
    </div>
  )
}
