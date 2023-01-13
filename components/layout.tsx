import { ReactNode } from 'react'

import Footer from './footer'
import NavBar from './nav-bar'

export default function Layout(props: { children: ReactNode }) {
  return (
    <>
      <NavBar />
      <main>{props.children}</main>
      <Footer />
    </>
  )
}
