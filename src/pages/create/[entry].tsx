import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

import CommunityForm from '../../components/community-form'
import useRouterQuery from '../../hooks/use-router-query'
import useWallet from '../../hooks/use-wallet'
import useDids from '../../hooks/use-dids'
import TextButton from '../../components/basic/text-button'
import { documentTitle } from '../../utils/constants'

export default function CreateEntryPage() {
  const router = useRouter()
  const query = useRouterQuery<['entry']>()
  const { account } = useWallet()
  const { data: dids } = useDids(account)
  const isAdmin = useMemo(
    () => !!(query.entry && dids?.includes(query.entry)),
    [dids, query.entry],
  )
  const handleSuccess = useCallback(() => {
    router.push(`/${query.entry}`)
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
          <div className="flex w-full flex-col">
            <CommunityForm
              entry={query.entry}
              onSuccess={handleSuccess}
              disabled={!isAdmin}
            />
          </div>
        ) : null}
      </div>
    </>
  )
}
