import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import Button from '../../components/basic/button'
import DidCombobox from '../../components/did-combobox'
import LoadingBar from '../../components/basic/loading-bar'
import useDids from '../../hooks/use-dids'
import useWallet from '../../hooks/use-wallet'
import { documentTitle, isTestnet } from '../../utils/constants'
import { trpc } from '../../utils/trpc'

export default function CreateCommunityPage() {
  const { account, connect } = useWallet()
  const { data, isLoading } = useDids(account)
  const [entry, setEntry] = useState('')
  const dids = useMemo(
    () => data?.filter((did) => did.indexOf('.') === did.lastIndexOf('.')),
    [data],
  )
  const { data: existences, isLoading: isExistencesLoading } =
    trpc.community.checkExistences.useQuery(
      { entries: dids },
      { enabled: !!dids?.length },
    )
  const didOptions = useMemo(
    () => dids?.map((did) => ({ did, disabled: existences?.[did] })),
    [dids, existences],
  )
  useEffect(() => {
    setEntry(didOptions?.find(({ disabled }) => !disabled)?.did || '')
  }, [didOptions])

  return (
    <>
      <Head>
        <title>{`New community - ${documentTitle}`}</title>
      </Head>
      <LoadingBar loading={isLoading || isExistencesLoading} />
      <div className="w-full bg-white">
        <div className="py-24 sm:px-6 sm:py-32">
          <div className="mx-auto text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900">
              Create a community
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
              {didOptions?.length === 0
                ? 'You need a DID to create community'
                : 'to hear valuable voices from your community members'}
            </p>
            <div className="mt-10 flex flex-col items-center space-y-6">
              {didOptions?.length === 0 ? (
                <a
                  href={
                    isTestnet
                      ? 'https://test2f7a872b.did.id/explorer'
                      : 'https://app.did.id/explorer'
                  }
                >
                  <Button large primary>
                    Register →
                  </Button>
                </a>
              ) : (
                <>
                  <DidCombobox
                    label="Select a DID as your community entry"
                    options={didOptions}
                    value={entry}
                    onChange={setEntry}
                    onClick={connect}
                  />
                  {entry ? (
                    <Link href={`/create/${entry}`}>
                      <Button large primary>
                        Next →
                      </Button>
                    </Link>
                  ) : (
                    <a
                      href={
                        isTestnet
                          ? 'https://test2f7a872b.did.id/explorer'
                          : 'https://app.did.id/explorer'
                      }
                    >
                      <Button large primary>
                        Register →
                      </Button>
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
