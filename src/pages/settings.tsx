import { useAtom } from 'jotai'

import Button from '../components/basic/button'
import { Form, FormItem, FormSection } from '../components/basic/form'
import { Grid6, GridItem2, GridItem6 } from '../components/basic/grid'
import Select from '../components/basic/select'
import useDids from '../hooks/use-dids'
import useWallet from '../hooks/use-wallet'
import { currentDidAtom } from '../utils/atoms'

export default function SettingsPage() {
  const { account, disconnect } = useWallet()
  const { data: dids } = useDids(account)
  const [currentDid, setCurrentDid] = useAtom(currentDidAtom)

  return (
    <Form className="w-full">
      <FormSection title="Account">
        <Grid6>
          <GridItem2>
            <FormItem label="Select your default DID">
              <Select
                disabled={!account}
                options={dids}
                value={currentDid}
                onChange={setCurrentDid}
              />
            </FormItem>
          </GridItem2>
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
