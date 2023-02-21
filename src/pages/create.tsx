import { useAtomValue } from 'jotai'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import Alert from '../components/basic/alert'
import { FormItem, FormSection } from '../components/basic/form'
import { Grid6, GridItem2, GridItem6 } from '../components/basic/grid'
import Select from '../components/basic/select'
import useDids from '../hooks/use-dids'
import useWallet from '../hooks/use-wallet'
import { currentDidAtom } from '../utils/atoms'
import { trpc } from '../utils/trpc'

export default function CreateCommunityPage() {
  const router = useRouter()
  const { account } = useWallet()
  const currentDid = useAtomValue(currentDidAtom)
  const { data: dids } = useDids(account)
  const [entry, setEntry] = useState('')
  const { data: community } = trpc.community.getByEntry.useQuery(
    { entry },
    { enabled: !!entry },
  )
  useEffect(() => {
    setEntry(dids?.find((d) => d === currentDid) || dids?.[0] || '')
  }, [currentDid, dids, setEntry])

  return (
    <FormSection
      title="Create community"
      description="select an DID as your community entry"
      className="w-full"
    >
      <Grid6 className="w-full">
        <GridItem2>
          <FormItem label="DID">
            <Select
              options={dids}
              value={entry}
              onChange={setEntry}
              className="w-fit"
            />
          </FormItem>
        </GridItem2>
        <GridItem6>
          {dids?.length === 0 ? (
            <Alert
              type="info"
              action="Register"
              onClick={() => {
                window.open('https://app.did.id/explorer')
              }}
            >
              Do not have a DID? Register now!
            </Alert>
          ) : community ? (
            <Alert
              type="warning"
              action="View"
              onClick={() => {
                router.push(`/${entry}`)
              }}
            >
              Community of <b>{entry}</b> already exists.
            </Alert>
          ) : (
            <Alert
              type="success"
              action="Create"
              onClick={() => {
                router.push(`/${entry}/settings`)
              }}
            >
              <b>{entry}</b> is able to be used as community entry.
            </Alert>
          )}
        </GridItem6>
      </Grid6>
    </FormSection>
  )
}
