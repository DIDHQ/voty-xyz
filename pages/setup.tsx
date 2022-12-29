import dynamic from 'next/dynamic'

const SetupOrganizationDialog = dynamic(
  () => import('../components/setup-organization-dialog'),
  { ssr: false },
)

export default function SetupPage() {
  return <SetupOrganizationDialog />
}
