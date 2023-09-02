import Link from 'next/link'
import { ArrowLongRightIcon } from '@heroicons/react/24/outline'
import { Container } from '../components/basic/container'
import Card from '../components/basic/card'

export default function NotFoundPage() {
  return (
    <Container size="small">
      <Card className="flex flex-col items-center py-20 text-center md:py-20">
        <p className="mb-2 text-6xl font-bold text-primary-500 sm:text-8xl">
          404
        </p>

        <h1 className="text-display-xs-bold tracking-tight text-strong sm:text-display-md-bold">
          Page not found
        </h1>

        <p className="mt-2 text-md-regular text-subtle">
          Sorry, we couldn&#39;t find the page you&#39;re looking for.
        </p>

        <div className="mt-6">
          <Link
            className="flex items-center gap-2 text-md-medium text-primary-500 hover:text-primary-600"
            href="/"
          >
            <span>Go back home</span>

            <ArrowLongRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </Card>
    </Container>
  )
}
