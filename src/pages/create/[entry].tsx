import { useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

import CommunityForm from '../../components/community-form'
import useRouterQuery from '../../hooks/use-router-query'
import TextButton from '../../components/basic/text-button'
import { documentTitle } from '../../utils/constants'

export default function CreateEntryPage() {
  const router = useRouter()
  const query = useRouterQuery<['entry']>()
  const handlePreview = useCallback(() => {
    router.push(`/${query.entry}/about`)
  }, [query.entry, router])

  return (
    <>
      <Head>
        <title>{`New community - ${documentTitle}`}</title>
      </Head>
      <div className="w-full">
        <TextButton href="/create" className="mt-6 sm:mt-8">
          <h2 className="text-[1rem] font-semibold leading-6">← Back</h2>
        </TextButton>
        {query.entry ? (
          <CommunityForm
            author={query.entry}
            preview={{
              from: router.asPath,
              to: `/${query.entry}/about`,
              template: `You are creating community on Voty\n\nhash:\n{sha256}`,
              author: query.entry,
            }}
            onPreview={handlePreview}
            className="flex w-full flex-col"
          />
        ) : null}
      </div>
    </>
  )
}
