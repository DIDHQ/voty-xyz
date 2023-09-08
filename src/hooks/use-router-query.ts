import { useRouter } from 'next/router'
import { useMemo } from 'react'

import { id2Permalink } from '../utils/permalink'
import { previewPermalink } from '../utils/constants'
import { unFormatDid } from '../utils/did/utils'

export default function useRouterQuery<S extends string[] = []>() {
  const router = useRouter()
  return useMemo(
    () =>
      ({
        ...router.query,
        communityId:
          typeof router.query.communityId === 'string' &&
          router.query.communityId
            ? unFormatDid(router.query.communityId)
            : undefined,
        grantPermalink:
          typeof router.query.grantPermalink === 'string' &&
          router.query.grantPermalink &&
          router.query.grantPermalink !== previewPermalink
            ? id2Permalink(router.query.grantPermalink)
            : undefined,
        grantProposalPermalink:
          typeof router.query.grantProposalPermalink === 'string' &&
          router.query.grantProposalPermalink &&
          router.query.grantProposalPermalink !== previewPermalink
            ? id2Permalink(router.query.grantProposalPermalink)
            : undefined,
        groupProposalPermalink:
          typeof router.query.groupProposalPermalink === 'string' &&
          router.query.groupProposalPermalink &&
          router.query.groupProposalPermalink !== previewPermalink
            ? id2Permalink(router.query.groupProposalPermalink)
            : undefined,
      }) as Partial<{
        [key in S[number]]: string
      }>,
    [router],
  )
}
