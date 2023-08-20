import Link from 'next/link'
import { ArrowLongRightIcon } from '@heroicons/react/24/outline'
import { Container } from '../components/basic/container'
import Card from '../components/basic/card'

function ErrorPage() {
  return (
    <Container
      size="small">
      <Card
        className="flex flex-col items-center py-20 md:py-20">
        <h1 
          className="text-display-md-bold tracking-tight text-strong">
          Oops!
        </h1>
        
        <p 
          className="mt-2 text-md-regular text-subtle">
          An unexpected error occurred.
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
