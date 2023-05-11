import * as Sentry from '@sentry/nextjs'
import { NextPageContext } from 'next'
import Link from 'next/link'

function ErrorPage() {
  return (
    <main className="flex w-full grow flex-col">
      <div className="my-auto shrink-0 py-16">
        <p className="text-base font-semibold text-primary-600">500</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Error
        </h1>
        <p className="mt-2 text-base text-gray-500">
          An exception has occurred
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="text-base font-medium text-primary-600 hover:text-primary-500"
          >
            Go back home
            <span> &rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  )
}

ErrorPage.getInitialProps = async (contextData: NextPageContext) => {
  await Sentry.captureUnderscoreErrorException(contextData)

  return {}
}

export default ErrorPage
