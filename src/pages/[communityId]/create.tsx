import { useMemo } from 'react'
import { nanoid } from 'nanoid'
import Head from 'next/head'

import useRouterQuery from '../../hooks/use-router-query'
import GroupForm from '../../components/group-form'
import { trpc } from '../../utils/trpc'
import LoadingBar from '../../components/basic/loading-bar'
import { documentTitle } from '../../utils/constants'
import { Group } from '../../utils/schemas/v1/group'
import { BackBar } from '@/src/components/basic/back'
import { Container } from '@/src/components/basic/container'

export default function CreateGroupPage() {
  const query = useRouterQuery<['communityId']>()
  const { data: community, isLoading } = trpc.community.getById.useQuery(
    { id: query.communityId },
    { enabled: !!query.communityId },
  )
  const newGroup = useMemo(() => nanoid(), [])
  const initialValue = useMemo(
    () =>
      community && query.communityId
        ? ({
            id: newGroup,
            name: '',
            introduction: '',
            community: community.permalink,
            permission: {
              proposing: {
                operation: 'or',
                operands: [
                  {
                    function: 'prefixes_dot_suffix_exact_match',
                    arguments: [query.communityId, ['']],
                  },
                ],
              },
              voting: {
                operation: 'max',
                operands: [
                  {
                    name: '',
                    function: 'prefixes_dot_suffix_fixed_power',
                    arguments: [query.communityId, [], '1'],
                  },
                ],
              },
            },
            duration: {
              announcing: 86400,
              voting: 86400,
            },
            criteria_for_approval: '',
          } satisfies Group)
        : undefined,
    [community, newGroup, query.communityId],
  )

  return (
    <>
      <Head>
        <title>{`New workgroup - ${documentTitle}`}</title>
      </Head>

      <LoadingBar loading={isLoading} />

      <Container size="small">
        <BackBar href={`/${query.communityId}`} />

        {query.communityId && initialValue !== undefined ? (
          <GroupForm
            communityId={query.communityId}
            initialValue={initialValue}
            preview={{
              from: `/${query.communityId}/create`,
              to: `/${query.communityId}/group/${newGroup}/about?preview=true`,
              template: `You are creating workgroup on Voty\n\nhash:\n{keccak256}`,
              author: query.communityId,
            }}
          />
        ) : null}
      </Container>
    </>
  )
}
