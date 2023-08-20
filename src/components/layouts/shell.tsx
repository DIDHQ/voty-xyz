import { ReactNode } from 'react'
import dynamic from 'next/dynamic'

import PreviewBar from '../preview-bar'
import Header from '../header'
import Footer from '../footer'

const Banner = dynamic(() => import('../banner'), { ssr: false })

export default function ShellLayout(props: { children: ReactNode }) {
  return (
    <>
      <Banner />
    
      <Header />
      
      <div 
        className="mx-1 rounded-base bg-subtle px-3 pb-12 pt-6 min-[350px]:mx-1.5 sm:mx-3 sm:rounded-[32px] sm:px-4 md:mx-6 md:rounded-[48px] md:px-6 md:pb-16 md:pt-8 lg:mx-8 lg:px-8">
        {props.children}
      </div>
      
      <Footer />
      
      <PreviewBar />
    </>
  )
}
