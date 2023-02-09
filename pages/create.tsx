import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import Alert from '../components/basic/alert'
import { FormItem } from '../components/basic/form'
import { Grid6, GridItem2, GridItem6 } from '../components/basic/grid'
import DidSelect from '../components/did-select'
import { useEntryConfig, useRetrieve } from '../hooks/use-api'
import useDids from '../hooks/use-dids'
import useWallet from '../hooks/use-wallet'
import { DataType } from '../src/constants'

export default function CreateCommunityPage() {
  const router = useRouter()
  const { account } = useWallet()
  const { data: dids } = useDids(account)
  const [did, setDid] = useState('')
  const { data: config } = useEntryConfig(did)
  const { data: community } = useRetrieve(DataType.COMMUNITY, config?.community)

  return (
    <Grid6 className="mt-6">
      <GridItem2>
        <FormItem
          label="DID"
          description="select an DID as your community entry"
        >
          <DidSelect
            account={account}
            value={did}
            onChange={setDid}
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
        ) : community ? (
          <Alert
            type="warning"
            action="View"
            onClick={() => {
              router.push(`/${did}`)
            }}
          >
            Community of <b>{did}</b> already existed.
          </Alert>
        ) : (
          <Alert
            type="success"
            action="Create"
            onClick={() => {
              router.push(`/${did}/settings`)
            }}
          >
            <b>{did}</b> is able to create an community.
          </Alert>
        )}
      </GridItem6>
    </Grid6>
  )
}
