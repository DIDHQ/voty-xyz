import { useState } from 'react'

import Button from '../components/basic/button'
import { Form, FormItem, FormSection } from '../components/basic/form'
import { Grid6, GridItem6 } from '../components/basic/grid'
import Select from '../components/basic/select'
import useDids from '../hooks/use-dids'
import useWallet from '../hooks/use-wallet'

export default function SettingsPage() {
  const { account, disconnect } = useWallet()
  const { data: dids } = useDids(account)
  const [did, setDid] = useState('')

  return (
    <Form className="w-full">
      <FormSection title="Account">
        <Grid6>
          <GridItem6>
            <FormItem label="Select default DID">
              <Select
                top
                options={dids}
                value={did}
                onChange={setDid}
                className="w-60"
              />
            </FormItem>
          </GridItem6>
          <GridItem6>
            <FormItem label="Log out">
              <Button disabled={!account} onClick={disconnect}>
                Disconnect
              </Button>
            </FormItem>
          </GridItem6>
        </Grid6>
      </FormSection>
    </Form>
  )
}
