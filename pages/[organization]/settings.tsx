import { useRouter } from 'next/router'
import OrganizationForm from '../../components/organization-form'

export default function OrganizationSettingsPage() {
  const router = useRouter()
  const organization = router.query.organization as string | undefined

  return organization ? <OrganizationForm organization={organization} /> : null
}
