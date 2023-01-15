import OrganizationForm from '../../components/organization-form'
import useRouterQuery from '../../hooks/use-router-query'
import useArweaveData from '../../hooks/use-arweave-data'
import useDidConfig from '../../hooks/use-did-config'
import WorkgroupForm from '../../components/workgroup-form'
import { organizationWithSignatureSchema } from '../../src/schemas'

export default function OrganizationSettingsPage() {
  const [query] = useRouterQuery<['did', 'workgroup']>()
  const { data: config } = useDidConfig(query.did)
  const { data: organization } = useArweaveData(
    organizationWithSignatureSchema,
    config?.organization,
  )

  return query.did ? (
    <div className="flex justify-center mb-8">
      <div className="flex flex-col w-full px-8">
        {query.workgroup ? (
          organization ? (
            <WorkgroupForm
              organization={organization}
              workgroup={query.workgroup}
            />
          ) : null
        ) : (
          <OrganizationForm did={query.did} organization={organization} />
        )}
      </div>
    </div>
  ) : null
}
