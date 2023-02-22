import {
  ArrowTopRightOnSquareIcon,
  DocumentCheckIcon,
  DocumentPlusIcon,
} from '@heroicons/react/20/solid'
import { useAtomValue } from 'jotai'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import Button from '../components/basic/button'
import LoadingBar from '../components/basic/loading-bar'
import Select from '../components/basic/select'
import useDids from '../hooks/use-dids'
import useWallet from '../hooks/use-wallet'
import { currentDidAtom } from '../utils/atoms'
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
                className="border-r-0"
              />
              {dids?.length === 0 ? (
                isLoading ? (
                  <Button icon={ArrowTopRightOnSquareIcon} primary disabled>
                    Register
                  </Button>
                ) : (
                  <a href="https://app.did.id/explorer" className="z-10">
                    <Button icon={ArrowTopRightOnSquareIcon} primary>
                      Register
                    </Button>
                  </a>
                )
              ) : community ? (
                isLoading ? (
                  <Button icon={DocumentCheckIcon} disabled>
                    View
                  </Button>
                ) : (
                  <Link href={`/${entry}`} className="z-10">
                    <Button icon={DocumentCheckIcon}>View</Button>
                  </Link>
                )
              ) : isLoading ? (
                <Button icon={DocumentPlusIcon} primary disabled>
                  Create
                </Button>
              ) : (
                <Link href={`/${entry}/settings`} className="z-10">
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
