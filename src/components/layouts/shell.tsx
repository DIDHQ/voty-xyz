import { ReactNode } from 'react'
import dynamic from 'next/dynamic'

import { useRouter } from 'next/router'
import PreviewBar from '../preview-bar'
import Header from '../header'
import Footer from '../footer'
import useRouterQuery from '@/src/hooks/use-router-query'
import { clsxMerge } from '@/src/utils/tailwind-helper'

const Banner = dynamic(() => import('../banner'), { ssr: false })

export default function ShellLayout(props: { children: ReactNode }) {
  const query = useRouterQuery<['preview']>()
  const router = useRouter()

  return (
    <>
      <Banner />
    
      <Header />
      
      <div 
        className={clsxMerge(
          'mx-1 rounded-base bg-subtle px-3 pt-6 min-[350px]:mx-1.5 sm:mx-3 sm:rounded-[32px] sm:px-4 md:mx-6 md:rounded-[48px] md:px-6 md:pt-8 lg:mx-8 lg:px-8',
          query.preview || router.asPath.includes('/preview') ? 'pb-28' : 'pb-12 md:pb-16'
        )}>
        {props.children}
      </div>
            
      { query.preview || router.asPath.includes('/preview') ? null : <Footer />}
      
      <PreviewBar />
    </>
  )
}
