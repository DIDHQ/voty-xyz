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
              Select a DID as your community entry
            </p>
            <div className="mt-10 flex items-center justify-center">
              <Select
                options={dids}
                value={entry}
                onChange={setEntry}
                className="hover:z-10 active:z-10"
              />
              {dids?.length === 0 ? (
                <a
                  href={
                    isTestnet
                      ? 'https://test2f7a872b.did.id/explorer'
                      : 'https://app.did.id/explorer'
                  }
                  className="hover:z-10 active:z-10"
                >
                  <Button icon={ArrowTopRightOnSquareIcon} primary>
                    Register
                  </Button>
                </a>
              ) : community ? (
                isLoading ? (
                  <Button
                    icon={DocumentCheckIcon}
                    disabled
                    className="border-l-0 hover:z-10 active:z-10"
                  >
                    View
                  </Button>
                ) : (
                  <Link href={`/${entry}`} className="hover:z-10 active:z-10">
                    <Button
                      icon={DocumentCheckIcon}
                      className="border-l-0 hover:z-10 active:z-10"
                    >
                      View
                    </Button>
                  </Link>
                )
              ) : isLoading ? (
                <Button
                  icon={DocumentPlusIcon}
                  primary
                  disabled
                  className="border-l-0 hover:z-10 active:z-10"
                >
                  Create
                </Button>
              ) : (
                <Link
                  href={`/${entry}/settings`}
                  className="hover:z-10 active:z-10"
                >
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
