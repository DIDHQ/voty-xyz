import Head from 'next/head'
import { useMemo } from 'react'

import useRouterQuery from '../../../hooks/use-router-query'
import TextLink from '../../../components/basic/text-link'
import { documentTitle, previewPermalink } from '../../../utils/constants'
import GrantForm from '../../../components/grant-form'
import { Grant } from '../../../utils/schemas/v1/grant'

export default function CreateGrantPage() {
  const query = useRouterQuery<['communityId']>()
  const initialValue = useMemo<Partial<Grant> | null>(
    () =>
      query.communityId
        ? {
            permission: {
              proposing: {
                operation: 'or',
                operands: [
                  {
                    name: 'Any SubDID',
                    function: 'prefixes_dot_suffix_exact_match',
                    arguments: [query.communityId, []],
                  },
                ],
              },
              selecting: {
                operation: 'or',
                operands: [
                  {
                    name: 'Committee',
                    function: 'prefixes_dot_suffix_exact_match',
                    arguments: [query.communityId, []],
                  },
                ],
              },
              voting: {
                operation: 'max',
                operands: [
                  {
                    name: 'Any SubDID',
                    function: 'prefixes_dot_suffix_fixed_power',
                    arguments: [query.communityId, [], '1'],
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
    [query.communityId],
  )

  return (
    <>
      <Head>
        <title>{`New grant - ${documentTitle}`}</title>
      </Head>
      <div className="w-full">
        <TextLink
          disabled={!query.communityId}
          href={`/${query.communityId}/grant`}
          className="mt-6 inline-block sm:mt-8"
        >
          <h2 className="text-base font-semibold">← Back</h2>
        </TextLink>
        {query.communityId ? (
          <GrantForm
            communityId={query.communityId}
            initialValue={initialValue}
            preview={{
              from: `/${query.communityId}/grant/create`,
              to: `/${query.communityId}/grant/${previewPermalink}`,
              template: `You are creating grant on Voty\n\nhash:\n{keccak256}`,
              author: query.communityId,
            }}
          />
        ) : null}
      </div>
    </>
  )
}
