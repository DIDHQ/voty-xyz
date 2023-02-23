import { useCallback } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

import useRouterQuery from '../../../hooks/use-router-query'
import useWorkgroup from '../../../hooks/use-workgroup'
import TextButton from '../../../components/basic/text-button'
import { Grid6, GridItem6 } from '../../../components/basic/grid'
import { permalink2Id } from '../../../utils/permalink'
import { formatDuration } from '../../../utils/time'
import { DetailItem, DetailList } from '../../../components/basic/detail'
import { trpc } from '../../../utils/trpc'
import Article from '../../../components/basic/article'
import LoadingBar from '../../../components/basic/loading-bar'

const StatusIcon = dynamic(() => import('../../../components/status-icon'), {
  ssr: false,
})

const ProposalForm = dynamic(
  () => import('../../../components/proposal-from'),
  { ssr: false },
)

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
    <div className="flex w-full flex-1 flex-col items-start pt-6 sm:flex-row">
      <LoadingBar loading={isLoading} />
      <div className="w-full flex-1 sm:mr-6 sm:w-0">
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
          />
        ) : null}
      </div>
      <div className="relative mt-6 w-full shrink-0 sm:sticky sm:top-24 sm:mt-0 sm:w-72">
        <StatusIcon
          permalink={community?.entry.community}
          className="absolute right-4 top-4"
        />
        <Grid6 className="border border-gray-200 p-6">
          <GridItem6>
            <DetailList title="Workgroup">
              <DetailItem title="Name">{workgroup?.name}</DetailItem>
              <DetailItem title="Community">{community?.name}</DetailItem>
            </DetailList>
          </GridItem6>
          <GridItem6>
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
          </GridItem6>
          <GridItem6>
            <DetailList title="Terms and conditions">
              <Article small className="pt-2">
                {workgroup?.extension.terms_and_conditions}
              </Article>
            </DetailList>
          </GridItem6>
        </Grid6>
      </div>
    </div>
  )
}
