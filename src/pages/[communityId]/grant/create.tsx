import Head from 'next/head'
import { useMemo } from 'react'

import useRouterQuery from '../../../hooks/use-router-query'
import { documentTitle, previewPermalink } from '../../../utils/constants'
import GrantForm from '../../../components/grant-form'
import { Grant } from '../../../utils/schemas/v1/grant'
import { BackBar } from '@/src/components/basic/back'
import { Container } from '@/src/components/basic/container'
import { formatDid } from '@/src/utils/did/utils'

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
                    name: 'Any Second-Level DID',
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
                    name: 'Any Second-Level DID',
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

      <Container size="small">
        <BackBar
          disabled={!query.communityId}
          href={
            query.communityId ? `/${formatDid(query.communityId)}/grant` : '#'
          }
        />

        {query.communityId ? (
          <GrantForm
            communityId={query.communityId}
            initialValue={initialValue}
            preview={{
              from: `/${formatDid(query.communityId)}/grant/create`,
              to: `/${formatDid(
                query.communityId,
              )}/grant/${previewPermalink}?preview=true`,
              template: `You are creating grant on Voty\n\nhash:\n{keccak256}`,
              author: query.communityId,
            }}
          />
        ) : null}
      </Container>
    </>
  )
}
