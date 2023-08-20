import { ReactNode } from 'react'

import CommunityInfo from '../community-info'
import { Container, Main, Sidebar } from '../basic/container'

export default function CommunityLayout(props: { children: ReactNode }) {
  return (
    <Container
      hasSidebar>
      <Sidebar>
        <CommunityInfo />
      </Sidebar>  
      
      <Main>
        {props.children}
      </Main>
    </Container>
  )
}
