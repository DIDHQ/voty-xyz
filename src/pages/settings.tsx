import dynamic from 'next/dynamic'
import Head from 'next/head'

import { title } from '../utils/constants'

const SettingsForm = dynamic(() => import('../components/settings-form'), {
  ssr: false,
})

export default function SettingsPage() {
  return (
    <>
      <Head>
        <title>Settings - {title}</title>
      </Head>
      <SettingsForm />
    </>
  )
}
