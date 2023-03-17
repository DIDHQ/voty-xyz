import Head from 'next/head'
import { useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import { useVirtualizer } from '@tanstack/react-virtual'

import { DidOption } from '../../components/did-combobox'
import LoadingBar from '../../components/basic/loading-bar'
import useDids from '../../hooks/use-dids'
import useWallet from '../../hooks/use-wallet'
import { documentTitle, isTestnet } from '../../utils/constants'
import { trpc } from '../../utils/trpc'
import ConnectButton from '../../components/connect-button'
import TextInput from '../../components/basic/text-input'
import TextButton from '../../components/basic/text-button'

export default function CreateCommunityPage() {
  const router = useRouter()
  const { account } = useWallet()
  const { data, isLoading } = useDids(account)
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
  const [query, setQuery] = useState('')
  const filteredOptions =
    query === ''
      ? didOptions
      : didOptions?.filter((option) => {
          return option.did.toLowerCase().includes(query.toLowerCase())
        })
  const parentRef = useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: filteredOptions?.length || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
  })
  const register = useMemo(
    () => (
      <TextButton
        secondary
        href={
          isTestnet
            ? 'https://test2f7a872b.did.id/explorer'
            : 'https://app.did.id/explorer'
        }
      >
        Register →
      </TextButton>
    ),
    [],
  )

  return (
    <>
      <Head>
        <title>{`New community - ${documentTitle}`}</title>
      </Head>
      <LoadingBar loading={isLoading || isExistencesLoading} />
      <div className="w-full bg-white">
        <div className="pt-8 sm:px-6 sm:pt-16">
          <div className="mx-auto text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900">
              Create a community
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
              to hear valuable voices from your community members
            </p>
            <div className="mt-8 flex flex-col items-center space-y-6">
              {account ? (
                didOptions?.length ? (
                  <>
                    <div>
                      <span className="mb-1 block text-sm font-medium text-gray-700">
                        Select a DID as your community entry
                      </span>
                      <TextInput
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Type to filter"
                        className="rounded-b-none"
                      />
                      <div
                        ref={parentRef}
                        className="relative max-h-80 overflow-auto rounded-md rounded-t-none border border-t-0 text-base focus:outline-none sm:text-sm"
                      >
                        <div
                          style={{
                            height: `${rowVirtualizer.getTotalSize()}px`,
                          }}
                        >
                          {rowVirtualizer
                            .getVirtualItems()
                            .map((virtualItem) => (
                              <div
                                key={filteredOptions?.[virtualItem.index]?.did}
                                onClick={() => {
                                  if (
                                    !filteredOptions?.[virtualItem.index]
                                      ?.disabled
                                  ) {
                                    router.push(
                                      `/create/${
                                        filteredOptions?.[virtualItem.index]
                                          ?.did
                                      }`,
                                    )
                                  }
                                }}
                                className={clsx(
                                  'absolute top-0 left-0 flex w-full items-center py-2 px-3',
                                  filteredOptions?.[virtualItem.index]?.disabled
                                    ? 'cursor-not-allowed'
                                    : 'cursor-pointer hover:bg-gray-100',
                                )}
                                style={{
                                  height: `${virtualItem.size}px`,
                                  transform: `translateY(${virtualItem.start}px)`,
                                }}
                              >
                                <DidOption
                                  disabled={
                                    filteredOptions?.[virtualItem.index]
                                      ?.disabled
                                  }
                                  text={
                                    filteredOptions?.[virtualItem.index]?.did
                                  }
                                  label={
                                    filteredOptions?.[virtualItem.index]
                                      ?.disabled
                                      ? '(used)'
                                      : undefined
                                  }
                                />
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                    <span className="mb-1 block text-sm font-medium text-gray-400">
                      or {register}
                    </span>
                  </>
                ) : (
                  register
                )
              ) : (
                <ConnectButton />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
