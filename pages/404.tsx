export default function NotFoundPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl grow flex-col px-6 lg:px-8">
      <div className="my-auto shrink-0 py-16 sm:py-32">
        <p className="text-base font-semibold text-indigo-600">404</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-2 text-base text-gray-500">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <div className="mt-6">
          <a
            href="#"
            className="text-base font-medium text-indigo-600 hover:text-indigo-500"
          >
            Go back home
            <span aria-hidden="true"> &rarr;</span>
          </a>
        </div>
      </div>
    </main>
  )
}
