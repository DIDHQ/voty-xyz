import Link from 'next/link'
import { ArrowLongRightIcon } from '@heroicons/react/24/outline'
import { Container } from '../components/basic/container'
import Card from '../components/basic/card'

function ErrorPage() {
  return (
    <Container
      size="small">
      <Card
        className="flex flex-col items-center py-20 text-center md:py-20">
        <p 
          className="mb-2 text-6xl font-bold text-primary-500 sm:text-8xl">
          OOPS!
        </p>
        
        <h1 
          className="text-display-xs-bold tracking-tight text-strong sm:text-display-md-bold">
          Error Occurred
        </h1>
        
        <p 
          className="mt-2 text-md-regular text-subtle">
          Our apologies for the trouble. Please try again later.
        </p>
        
        <div 
          className="mt-6">
          <Link
            className="flex items-center gap-2 text-md-medium text-primary-500 hover:text-primary-600"
            href="/">
            <span>
              Go back home
            </span>
            
            <ArrowLongRightIcon
              className="h-5 w-5" />
          </Link>
        </div>
      </Card>
    </Container>
  )
}

export default ErrorPage
