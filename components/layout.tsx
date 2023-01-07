import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

import Footer from './footer'

const NavBar = dynamic(() => import('../components/nav-bar'), { ssr: false })

export default function Layout(props: { children: ReactNode }) {
  return (
    <>
      <NavBar />
      <main>{props.children}</main>
      <Footer />
    </>
  )
}
