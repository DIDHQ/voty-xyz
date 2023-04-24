import { useMemo } from 'react'
import { nanoid } from 'nanoid'
import Head from 'next/head'

import useRouterQuery from '../../hooks/use-router-query'
import WorkgroupForm from '../../components/workgroup-form'
import { trpc } from '../../utils/trpc'
import LoadingBar from '../../components/basic/loading-bar'
import { documentTitle } from '../../utils/constants'
import { Group } from '../../utils/schemas/group'
import TextButton from '../../components/basic/text-button'

export default function CreateGroupPage() {
  const query = useRouterQuery<['community_id']>()
  const { data: community, isLoading } = trpc.community.getById.useQuery(
    { id: query.community_id },
    { enabled: !!query.community_id },
  )
  const newGroup = useMemo(() => nanoid(), [])
  const initialValue = useMemo(
    () =>
      community && query.community_id
        ? ({
            id: newGroup,
            name: '',
            community: community.permalink,
            permission: {
              proposing: {
                operation: 'or',
                operands: [
                  {
                    function: 'prefixes_dot_suffix_exact_match',
                    arguments: [query.community_id, []],
                  },
                ],
              },
              voting: {
                operation: 'max',
                operands: [
                  {
                    function: 'prefixes_dot_suffix_fixed_power',
                    arguments: [query.community_id, [], '1'],
                  },
                ],
              },
            },
            duration: {
              pending: 86400,
              voting: 86400,
            },
            extension: {
              terms_and_conditions: '',
            },
          } satisfies Group)
        : undefined,
    [community, newGroup, query.community_id],
  )

  return (
    <>
      <Head>
        <title>{`New workgroup - ${documentTitle}`}</title>
      </Head>
      <LoadingBar loading={isLoading} />
      <div className="w-full">
        <TextButton href={`/${query.community_id}`} className="mt-6 sm:mt-8">
          <h2 className="text-base font-semibold">← Back</h2>
        </TextButton>
        {query.community_id && initialValue !== undefined ? (
          <WorkgroupForm
            author={query.community_id}
            initialValue={initialValue}
            preview={{
              from: `/${query.community_id}/create`,
              to: `/${query.community_id}/${newGroup}/about`,
              template: `You are creating workgroup on Voty\n\nhash:\n{sha256}`,
              author: query.community_id,
            }}
            className="pt-6 sm:pt-8"
          />
        ) : null}
      </div>
    </>
  )
}
