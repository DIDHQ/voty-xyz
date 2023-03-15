import { useCallback, useMemo } from 'react'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/router'
import Head from 'next/head'

import useRouterQuery from '../../hooks/use-router-query'
import WorkgroupForm from '../../components/workgroup-form'
import { trpc } from '../../utils/trpc'
import LoadingBar from '../../components/basic/loading-bar'
import { documentTitle } from '../../utils/constants'
import { Community } from '../../utils/schemas/community'
import TextButton from '../../components/basic/text-button'
import GrantForm from '../../components/grant-form'

export default function CreateGroupPage() {
  const router = useRouter()
  const query = useRouterQuery<['entry', 'type']>()
  const {
    data: community,
    isLoading,
    refetch,
  } = trpc.community.getByEntry.useQuery(
    { entry: query.entry },
    { enabled: !!query.entry },
  )
  const newGroup = useMemo(() => nanoid(), [])
  const initialValue = useMemo(
    () =>
      community && query.entry
        ? ({
            ...community,
            groups: [
              ...(community.groups || []),
              query.type === 'grant'
                ? {
                    id: newGroup,
                    name: '',
                    permission: {
                      proposing: {
                        operation: 'or',
                        operands: [
                          {
                            function: 'prefixes_dot_suffix_exact_match',
                            arguments: [query.entry, ['']],
                          },
                        ],
                      },
                      adding_option: {
                        operation: 'or',
                        operands: [
                          {
                            function: 'prefixes_dot_suffix_exact_match',
                            arguments: [query.entry, ['']],
                          },
                        ],
                      },
                      voting: {
                        operation: 'max',
                        operands: [
                          {
                            function: 'prefixes_dot_suffix_fixed_power',
                            arguments: [query.entry, [''], '1'],
                          },
                        ],
                      },
                    },
                    duration: {
                      pending: 86400,
                      adding_option: 86400,
                      voting: 86400,
                    },
                    extension: {
                      type: 'grant',
                    },
                  }
                : {
                    id: newGroup,
                    name: '',
                    permission: {
                      proposing: {
                        operation: 'or',
                        operands: [
                          {
                            function: 'prefixes_dot_suffix_exact_match',
                            arguments: [query.entry, ['']],
                          },
                        ],
                      },
                      voting: {
                        operation: 'max',
                        operands: [
                          {
                            function: 'prefixes_dot_suffix_fixed_power',
                            arguments: [query.entry, [''], '1'],
                          },
                        ],
                      },
                    },
                    duration: {
                      pending: 86400,
                      voting: 86400,
                    },
                    extension: {
                      type: 'workgroup',
                      terms_and_conditions: '',
                    },
                  },
            ],
          } satisfies Community)
        : undefined,
    [community, newGroup, query.entry, query.type],
  )
  const handleSuccess = useCallback(() => {
    refetch()
    router.push(`/${query.entry}/${newGroup}/rules`)
  }, [newGroup, query.entry, refetch, router])

  return (
    <>
      <Head>
        <title>{`New workgroup - ${documentTitle}`}</title>
      </Head>
      <LoadingBar loading={isLoading} />
      <div className="w-full">
        <TextButton href={`/${query.entry}`} className="mt-6 sm:mt-8">
          <h2 className="text-[1rem] font-semibold leading-6">← Back</h2>
        </TextButton>
        {query.type === 'grant' ? (
          <GrantForm
            author={query.entry || ''}
            initialValue={initialValue}
            group={newGroup}
            isNewGroup
            onSuccess={handleSuccess}
            className="pt-6 sm:pt-8"
          />
        ) : (
          <WorkgroupForm
            author={query.entry || ''}
            initialValue={initialValue}
            group={newGroup}
            isNewGroup
            onSuccess={handleSuccess}
            className="pt-6 sm:pt-8"
          />
        )}
      </div>
    </>
  )
}
