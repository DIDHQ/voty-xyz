import { ReactNode } from 'react'

import CommunityInfo from '../community-info'
import { Container, Main, Sidebar } from '../basic/container'
import LoadingBar from '../basic/loading-bar'

export default function CommunityLayout(props: { 
  loading?: boolean
  children: ReactNode
}) {
  const {
    loading = false,
    children
  } = props
  
  return (
    <Container
      hasSidebar>
      <LoadingBar 
        loading={loading} />
         
      <Sidebar>
        <CommunityInfo
          loading={loading} />
      </Sidebar>  
      
      <Main>
        {children}
      </Main>
    </Container>
  )
}
