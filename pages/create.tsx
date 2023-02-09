import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import Alert from '../components/basic/alert'
import FormItem from '../components/basic/form-item'
import { Grid6, GridItem2, GridItem6 } from '../components/basic/grid'
import DidSelect from '../components/did-select'
import { useEntryConfig } from '../hooks/use-api'
import useDids from '../hooks/use-dids'
import useWallet from '../hooks/use-wallet'

export default function CreateCommunityPage() {
  const router = useRouter()
  const { account } = useWallet()
  const { data: dids } = useDids(account)
  const [entry, setEntry] = useState('')
  useEffect(() => {
    setEntry(dids?.[0] || '')
  }, [dids])
  const { data: config } = useEntryConfig(entry)

  return (
    <Grid6 className="mt-6">
      <GridItem2>
        <FormItem
          label="DID"
          description="select an DID as your community entry"
        >
          <DidSelect
            account={account}
            value={entry}
            onChange={setEntry}
            className="w-80"
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
        ) : config?.community ? (
          <Alert
            type="warning"
            action="View"
            onClick={() => {
              router.push(`/${entry}`)
            }}
          >
            Community of <b>{entry}</b> already existed.
          </Alert>
        ) : (
          <Alert
            type="success"
            action="Create"
            onClick={() => {
              router.push(`/${entry}/settings`)
            }}
          >
            <b>{entry}</b> is able to create an community.
          </Alert>
        )}
      </GridItem6>
    </Grid6>
  )
}
