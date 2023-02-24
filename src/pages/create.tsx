import {
  ArrowTopRightOnSquareIcon,
  DocumentCheckIcon,
  DocumentPlusIcon,
} from '@heroicons/react/20/solid'
import { useAtomValue } from 'jotai'
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import Button from '../components/basic/button'
import LoadingBar from '../components/basic/loading-bar'
import Select from '../components/basic/select'
import useDids from '../hooks/use-dids'
import useWallet from '../hooks/use-wallet'
import { currentDidAtom } from '../utils/atoms'
import { documentTitle, isTestnet } from '../utils/constants'
import { trpc } from '../utils/trpc'

export default function CreateCommunityPage() {
  const { account } = useWallet()
  const currentDid = useAtomValue(currentDidAtom)
  const { data: dids } = useDids(account)
  const [entry, setEntry] = useState('')
  const { data: community, isLoading } = trpc.community.getByEntry.useQuery(
    { entry },
    { enabled: !!entry, refetchOnWindowFocus: false },
  )
  useEffect(() => {
    setEntry(dids?.find((d) => d === currentDid) || dids?.[0] || '')
  }, [currentDid, dids, setEntry])

  return (
    <>
      <Head>
        <title>{`Create community - ${documentTitle}`}</title>
      </Head>
      <LoadingBar loading={isLoading} />
      <div className="w-full bg-white">
        <div className="py-24 sm:px-6 sm:py-32">
          <div className="mx-auto text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900">
              Create community
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
              {dids?.length === 0
                ? 'You need a DID to create community'
                : 'Select a DID as your community entry'}
            </p>
            <div className="mt-10 flex flex-col items-center space-y-6">
              {dids?.length === 0 ? null : (
                <Select options={dids} value={entry} onChange={setEntry} />
              )}
              {dids?.length === 0 ? (
                <a
                  href={
                    isTestnet
                      ? 'https://test2f7a872b.did.id/explorer'
                      : 'https://app.did.id/explorer'
                  }
                >
                  <Button icon={ArrowTopRightOnSquareIcon} primary>
                    Register
                  </Button>
                </a>
              ) : community ? (
                isLoading ? (
                  <Button icon={DocumentCheckIcon} disabled>
                    View
                  </Button>
                ) : (
                  <Link href={`/${entry}`}>
                    <Button icon={DocumentCheckIcon}>View</Button>
                  </Link>
                )
              ) : isLoading ? (
                <Button icon={DocumentPlusIcon} primary disabled>
                  Create
                </Button>
              ) : (
                <Link href={`/${entry}/settings`}>
                  <Button icon={DocumentPlusIcon} primary>
                    Create
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
