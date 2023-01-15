import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

const Sidebar = dynamic(() => import('../components/sidebar'), { ssr: false })

export default function Layout(props: { children: ReactNode }) {
  return <Sidebar>{props.children}</Sidebar>
}
