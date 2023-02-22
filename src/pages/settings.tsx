import dynamic from 'next/dynamic'
import Head from 'next/head'

import { documentTitle } from '../utils/constants'

const SettingsForm = dynamic(() => import('../components/settings-form'), {
  ssr: false,
})

export default function SettingsPage() {
  return (
    <>
      <Head>
        <title>{`Settings - ${documentTitle}`}</title>
      </Head>
      <SettingsForm />
    </>
  )
}
