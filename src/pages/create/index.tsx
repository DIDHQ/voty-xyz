import Head from 'next/head'
import { useMemo, useRef, useState } from 'react'
import { clsx } from 'clsx'
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
import TextLink from '../../components/basic/text-link'
import Button from '../../components/basic/button'
import { isSecondLevelDID } from '../../utils/did/utils'
import Card from '@/src/components/basic/card'
import { Container } from '@/src/components/basic/container'
import { BackBar } from '@/src/components/basic/back'

export default function CreateCommunityPage() {
  const router = useRouter()
  const { account } = useWallet()
  const { data, isLoading } = useDids(account)
  const dids = useMemo(
    () => data?.filter((did) => !isSecondLevelDID(did)),
    [data],
  )
  const { data: existences, isLoading: isExistencesLoading } =
    trpc.community.checkExistences.useQuery(
      { ids: dids },
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

  return (
    <>
      <Head>
        <title>{`Import community - ${documentTitle}`}</title>
      </Head>

      <LoadingBar
        loading={isLoading || (!!dids?.length && isExistencesLoading)}
      />

      <Container size="small">
        <BackBar href="/" />

        <div className="mb-6 text-center">
          <h2 className="text-display-xs-semibold text-strong">
            Import your community
          </h2>

          <p className="mx-auto mt-2 max-w-2xl text-sm-regular text-subtle">
            to hear the real voices from your community members.
          </p>
        </div>

        <Card className="md:py-18" size="large">
          <div className="mx-auto max-w-sm">
            {account ? (
              didOptions?.length ? (
                <>
                  <div className="mb-2 text-sm font-medium text-strong">
                    Choose a Top-Level DID as your community entry on Voty
                  </div>

                  <TextInput
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search"
                    className="rounded-b-none"
                  />

                  <div
                    ref={parentRef}
                    className="relative max-h-80 overflow-auto rounded-xl rounded-t-none border border-t-0 border-base text-base focus:outline-none"
                  >
                    <div
                      style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                      }}
                    >
                      {rowVirtualizer.getVirtualItems().map((virtualItem) => (
                        <div
                          key={filteredOptions?.[virtualItem.index]?.did}
                          onClick={() => {
                            if (
                              !filteredOptions?.[virtualItem.index]?.disabled
                            ) {
                              router.push(
                                `/create/${filteredOptions?.[virtualItem.index]
                                  ?.did}`,
                              )
                            }
                          }}
                          className={clsx(
                            'absolute left-0 top-0 flex w-full items-center px-3 py-2',
                            filteredOptions?.[virtualItem.index]?.disabled
                              ? 'cursor-not-allowed'
                              : 'cursor-pointer hover:bg-subtle',
                          )}
                          style={{
                            height: `${virtualItem.size}px`,
                            transform: `translateY(${virtualItem.start}px)`,
                          }}
                        >
                          <DidOption
                            disabled={
                              filteredOptions?.[virtualItem.index]?.disabled
                            }
                            text={filteredOptions?.[virtualItem.index]?.did}
                            label={
                              filteredOptions?.[virtualItem.index]?.disabled
                                ? 'used'
                                : undefined
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 text-sm-medium text-subtle">
                    Or{' '}
                    <TextLink
                      href={
                        isTestnet
                          ? 'https://test.d.id/bit/reg'
                          : 'https://d.id/bit/reg'
                      }
                      primary
                    >
                      Register a .bit{' '}
                    </TextLink>
                    and{' '}
                    <TextLink
                      href={
                        isTestnet
                          ? 'https://test.topdid.com/'
                          : 'https://topdid.com/'
                      }
                      primary
                    >
                      Upgrade it to Top-Level DID
                    </TextLink>{' '}
                    →
                  </div>
                </>
              ) : (
                <>
                  <p className="mb-4 text-sm font-medium text-strong">
                    You need a Top-Level DID as your community entry
                  </p>

                  <a
                    href={
                      isTestnet
                        ? 'https://test2f7a872b.did.id/explorer'
                        : 'https://app.did.id/explorer'
                    }
                  >
                    <Button primary size="large">
                      Register
                    </Button>
                  </a>
                </>
              )
            ) : (
              <ConnectButton />
            )}

            <ul className="mt-8 space-y-2 border-t border-dashed border-base pt-4 text-xs-regular text-moderate">
              <li>
                Voty is a DID-based, free and open-sourced community management
                platform.
              </li>

              <li>
                We are dedicated to achieving a DID-based governance future.
              </li>

              <li>
                Learn more about how Voty works and the thoughts behind
                DID-based governance{' '}
                <TextLink href="/about" primary>
                  here
                </TextLink>
                .
              </li>
            </ul>
          </div>
        </Card>
      </Container>
    </>
  )
}
