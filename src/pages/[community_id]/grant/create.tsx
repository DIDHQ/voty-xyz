import Head from 'next/head'
import { useMemo } from 'react'

import useRouterQuery from '../../../hooks/use-router-query'
import TextButton from '../../../components/basic/text-button'
import { documentTitle, previewPermalink } from '../../../utils/constants'
import GrantForm from '../../../components/grant-form'
import { Grant } from '../../../utils/schemas/v1/grant'

export default function CreateGrantPage() {
  const query = useRouterQuery<['community_id']>()
  const initialValue = useMemo<Partial<Grant> | null>(
    () =>
      query.community_id
        ? {
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
              announcing: 86400,
              proposing: 86400,
              voting: 86400,
            },
          }
        : null,
    [query.community_id],
  )

  return (
    <>
      <Head>
        <title>{`New grant - ${documentTitle}`}</title>
      </Head>
      <div className="w-full">
        <TextButton
          disabled={!query.community_id}
          href={`/${query.community_id}/grant`}
          className="mt-6 sm:mt-8"
        >
          <h2 className="text-base font-semibold">← Back</h2>
        </TextButton>
        {query.community_id ? (
          <GrantForm
            communityId={query.community_id}
            initialValue={initialValue}
            preview={{
              from: `/${query.community_id}/grant/create`,
              to: `/${query.community_id}/grant/${previewPermalink}`,
              template: `You are creating grant on Voty\n\nhash:\n{sha256}`,
              author: query.community_id,
            }}
          />
        ) : null}
      </div>
    </>
  )
}
