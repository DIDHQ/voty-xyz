import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <main className="flex w-full grow flex-col">
      <div className="my-auto shrink-0 py-16">
        <p className="text-base font-semibold text-primary-600">404</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-2 text-base text-gray-500">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="text-base font-medium text-primary-600 hover:text-primary-500"
          >
            Go back home
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
