import Head from 'next/head'

import useRouterQuery from '../../../hooks/use-router-query'
import TextButton from '../../../components/basic/text-button'
import { documentTitle } from '../../../utils/constants'

export default function CreateGrantPage() {
  const query = useRouterQuery<['community_id']>()

  return (
    <>
      <Head>
        <title>{`New grant - ${documentTitle}`}</title>
      </Head>
      {/* <LoadingBar loading={isLoading} /> */}
      <div className="w-full">
        <TextButton
          disabled={!query.community_id}
          href={`/${query.community_id}/grant`}
          className="mt-6 sm:mt-8"
        >
          <h2 className="text-base font-semibold">← Back</h2>
        </TextButton>
      </div>
    </>
  )
}
