import Button from '../components/basic/button'
import { Form, FormItem, FormSection } from '../components/basic/form'
import { Grid6, GridItem6 } from '../components/basic/grid'
import useWallet from '../hooks/use-wallet'

export default function SettingsForm() {
  const { account, disconnect } = useWallet()

  return (
    <Form className="w-full">
      <FormSection title="Settings">
        <Grid6>
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
