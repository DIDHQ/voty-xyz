import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import Alert from '../components/basic/alert'
import { FormItem } from '../components/basic/form'
import { Grid6, GridItem2, GridItem6 } from '../components/basic/grid'
import Select from '../components/basic/select'
import { useEntryConfig, useRetrieve } from '../hooks/use-api'
import useDids from '../hooks/use-dids'
import useWallet from '../hooks/use-wallet'
import { DataType } from '../src/constants'

export default function CreateCommunityPage() {
  const router = useRouter()
  const { account, did } = useWallet()
  const { data: dids } = useDids(account)
  const [entry, setEntry] = useState('')
  const { data: config } = useEntryConfig(entry)
  const { data: community } = useRetrieve(DataType.COMMUNITY, config?.community)
  useEffect(() => {
    setEntry(dids?.find((d) => d === did) || dids?.[0] || '')
  }, [did, dids, setEntry])

  return (
    <Grid6 className="mt-6">
      <GridItem2>
        <FormItem
          label="DID"
          description="select an DID as your community entry"
        >
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
  )
}
