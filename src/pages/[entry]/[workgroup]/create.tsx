import { useCallback } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

import useRouterQuery from '../../../hooks/use-router-query'
import useWorkgroup from '../../../hooks/use-workgroup'
import TextButton from '../../../components/basic/text-button'
import { permalink2Id } from '../../../utils/permalink'
import { formatDuration } from '../../../utils/time'
import { DetailItem, DetailList } from '../../../components/basic/detail'
import { trpc } from '../../../utils/trpc'
import Article from '../../../components/basic/article'
import LoadingBar from '../../../components/basic/loading-bar'
import ProposalForm from '../../../components/proposal-from'

const Slide = dynamic(() => import('../../../components/basic/slide'), {
  ssr: false,
})

export default function CreateProposalPage() {
  const router = useRouter()
  const query = useRouterQuery<['entry', 'workgroup']>()
  const { data: community, isLoading } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry, refetchOnWindowFocus: false },
  )
  const workgroup = useWorkgroup(community, query.workgroup)
  const handleSuccess = useCallback(
    (permalink: string) => {
      router.push(
        `/${query.entry}/${query.workgroup}/${permalink2Id(permalink)}`,
      )
    },
    [query.entry, query.workgroup, router],
  )

  return (
    <div className="flex w-full flex-1 flex-col items-start sm:flex-row">
      <LoadingBar loading={isLoading} />
      <div className="w-full flex-1 pt-6 sm:mr-10 sm:w-0 sm:pt-8">
        <TextButton
          href={
            query.entry && query.workgroup
              ? `/${query.entry}/${query.workgroup}`
              : undefined
          }
        >
          <h2 className="text-[1rem] font-semibold leading-6">← Back</h2>
        </TextButton>
        {community && workgroup ? (
          <ProposalForm
            community={community}
            workgroup={workgroup}
            onSuccess={handleSuccess}
            className="pt-6"
          />
        ) : null}
      </div>
      <div className="relative mt-[-1px] w-full shrink-0 pt-6 sm:sticky sm:top-18 sm:w-72 sm:pt-8">
        <div className="space-y-6 rounded border border-gray-200 p-6">
          <DetailList title="Information">
            <DetailItem
              title="Community"
              className="truncate whitespace-nowrap"
            >
              {community?.name || '...'}
            </DetailItem>
            <DetailItem
              title="Workgroup"
              className="truncate whitespace-nowrap"
            >
              {workgroup?.name || '...'}
            </DetailItem>
          </DetailList>
          <DetailList title="Proposers">
            {workgroup?.permission.proposing.operands.map((operand, index) => (
              <DetailItem
                key={operand.function + index}
                title={operand.name || `Group ${index}`}
                className="truncate whitespace-nowrap"
              >
                <Slide
                  title="Proposers"
                  trigger={({ handleOpen }) => (
                    <TextButton secondary onClick={handleOpen}>
                      View
                    </TextButton>
                  )}
                  small
                >
                  {() => (
                    <DetailList title={operand.name || `Group ${index}`}>
                      <DetailItem title="Base on">
                        {operand.arguments[0] === 'bit' ? '.bit' : 'SubDID'}
                      </DetailItem>
                      <DetailItem title="Filter">
                        {operand.arguments[1].length ? 'Allowlist' : 'All'}
                      </DetailItem>
                      {operand.arguments[1].length ? (
                        <DetailItem title="Allowlist">
                          {operand.arguments[1]
                            .map(
                              (argument) =>
                                `${argument}.${operand.arguments[0]}`,
                            )
                            .join('\n')}
                        </DetailItem>
                      ) : null}
                    </DetailList>
                  )}
                </Slide>
              </DetailItem>
            ))}
          </DetailList>
          <DetailList title="Duration">
            <DetailItem title="Announcement">
              {workgroup
                ? formatDuration(workgroup.duration.announcement)
                : null}
            </DetailItem>
            <DetailItem title="Voting">
              {workgroup ? formatDuration(workgroup.duration.voting) : null}
            </DetailItem>
          </DetailList>
          <DetailList title="Terms and conditions">
            <Article small className="pt-2">
              {workgroup?.extension.terms_and_conditions}
            </Article>
          </DetailList>
        </div>
      </div>
    </div>
  )
}
