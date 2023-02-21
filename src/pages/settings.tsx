import dynamic from 'next/dynamic'

const SettingsForm = dynamic(() => import('../components/settings-form'), {
  ssr: false,
})

export default function SettingsPage() {
  return <SettingsForm />
}
