import Head from 'next/head'

import useRouterQuery from '../../../hooks/use-router-query'
import useGroup from '../../../hooks/use-group'
import TextButton from '../../../components/basic/text-button'
import { trpc } from '../../../utils/trpc'
import LoadingBar from '../../../components/basic/loading-bar'
import ProposalForm from '../../../components/proposal-form'
import { documentTitle } from '../../../utils/constants'

export default function CreateProposalPage() {
  const query = useRouterQuery<['entry', 'group']>()
  const { data: community, isLoading } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry },
  )
  const group = useGroup(community, query.group)
  const type = group
    ? group.extension.type === 'grant'
      ? 'round'
      : 'proposal'
    : undefined

  return (
    <>
      <Head>
        <title>{`New ${type || ''} - ${documentTitle}`}</title>
      </Head>
      <LoadingBar loading={isLoading} />
      <div className="w-full">
        <TextButton
          disabled={!query.entry || !query.group}
          href={`/${query.entry}/${query.group}`}
          className="mt-6 sm:mt-8"
        >
          <h2 className="text-[1rem] font-semibold leading-6">← Back</h2>
        </TextButton>
        <ProposalForm
          community={community || undefined}
          group={group}
          className="pt-6 sm:pt-8"
        />
      </div>
    </>
  )
}
