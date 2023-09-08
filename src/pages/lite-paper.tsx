import Head from 'next/head'
import { GetStaticProps } from 'next'

import Article from '../components/basic/article'
import MarkdownViewer from '../components/basic/markdown-viewer'
import { documentTitle } from '../utils/constants'
import Card from '../components/basic/card'
import { Container } from '../components/basic/container'

export default function LitePaperPage() {
  return (
    <>
      <Head>
        <title>{`Lite Paper - ${documentTitle}`}</title>
      </Head>

      <Container size="small">
        <Card size="large">
          <Article>
            <MarkdownViewer>{`# Introduction

  Voty is a decentralized voting protocol based on DID, that aims to offer a fair and user-friendly governance system for all types of communities. Unlike token-based voting systems, Voty has proposed the idea of **"DID-based Governance"**, which enables communities to obtain valuable opinions from all members, instead of concentrating power among a select few.

  ## Defects in current voting systems

  ### 1. Token-based

  All commonly-used voting systems on the market are token-based, meaning that a user's right to vote and the weight it carries are determined by the amount of tokens the user holds.
  This leads to two major issues:

  - Inability to benefit organizations and communities who haven't issued tokens;
  - Powers can be easily transferred as voting rights are based on tokens.

  ![](/lite-paper/0.png)

  It's evident that the number of communities that have issued tokens is significantly lower than those that haven't. Issuing tokens in the early stages of a community can be a burden rather than an advantage. These communities will face challenges such as: token distribution, token pricing, liquidity, and preventing speculations from disrupting the community's dynamics and relationships.

  We can conclude that there will be a large number of communities that will run well without tokens, but these communities will undoubtedly have governance needs, and existing voting systems will not be able to meet this demand.

  Whether the tokens are fungible or non-fungible, they can easily be traded on the market. Using them as voting rights means that the voting rights can also be easily traded, and that leads to potential corruption and speculation.

  In most cases, those with the most influence in the community are not the ones who contribute the most. Instead, they are often speculators, the wealthy in the real world, or a small number of project founders who have managed to obtain more tokens. If someone who does not have tokens wants to steer the community in the right direction, they must first purchase tokens from these individuals, which will expose them to the risk of token value fluctuations and severely limit the development of the community.

  We are not saying that governance based on token is completely unfeasible. In fact, those communities that aim for financial returns are often token-based. However, we believe that most communities, or a community most of the time, are not able to be and do not need to be governed based on token.

  ### 2. Allows for nonprofessional involvement

  In any community there is a division of work based on specialization. For example, a group of engineers might come together to provide technical support for the community, a group of marketers might contribute their knowledge and time to the community's marketing efforts, and a group of language majors might offer multilingual support for the community.

  In the real world, decisions about which technology a product should adopt are typically made based on the opinions of engineers alone. Similarly, decisions about where the community should increase its marketing investment are based on the opinions of marketers. However, in the current voting system, any member who holds voting rights (which are token-based and easily obtained) can participate in all proposals by voting, even if they don't fully understand the meaning of the proposal. This can result in a situation where nonprofessionals make decisions about how professionals should work.

  ### 3. Low voter turnout

  Voter turnout is a crucial indicator that all communities concern, as it represents the extent to which a proposal takes into account the voices of the community.

  Low voter turnout arises from a lack of motivation. When communities attempt to provide incentives to encourage their members to vote, the existing voting systems fall short, mainly in the following ways: administrators cannot offer members incentives through the voting systems after they have voted, and the voting systems do not provide a comprehensive report of member participation.

  ## Voty's advantage

  Voty is a cutting-edge voting system. It far surpasses other existing voting systems on the market in many aspects.

  ### 1. DID based

  There's no doubt that using Second-Level DID of .bit (or a SubDomain of ENS) as a system for recognizing community identity is an unavoidable trend. Whether it's a DAO, a brand, a celebrity, or any type of community, they can bring their members/fans together by distributing Second-Level DID, creating a highly recognizable community.

  Using the Nike community as an example (a hypothetical case), possession of alice.nike.bit is direct evidence of Alice's membership in the Nike community. By owning alice.nike.bit, Alice has the right to participate in governance and express her opinions within the community, even if she doesn't hold any tokens from the community (or in other words, there's no need for the community to issue any tokens)

  When setting up Voty, community administrators can assign a .bit account to represent the community, such as nike.bit. This will allow only users who possess a xxx.nike.bit account to be recognized as members of the community and participate in governance by creating proposals or casting votes.Community administrators can specify a .bit account associated with the community when initializing Voty, for example: nike.bit. By doing this, only users who own xxx.nike.bit are considered as community members, and allowed to initiate proposals or vote on proposals within the community.

  ### 2. "Workgroup" structure design

  ![](/lite-paper/1.png)

  In Voty, a community is composed of one to many Workgroups. Administrators can set different purposes, voting rules, eligible proposal initiators, and eligible voters for each Workgroup.

  This design enables effective governance in large communities by allowing different Workgroups within the community to handle different divisions of work. They can make independent decisions and operate without interference from one another.

  A member may be part of multiple Workgroups, just as a person may hold multiple positions in the real world.

  ### 3. Flexible "Member Set" functionality and weight distribution

  Each Workgroup has three crucial components: rules, proposers, and voters. To handle different scenarios, the concept of "Member Set" was proposed. Simply put, Member Set is a list of members who meet certain specified criteria.

  Each Workgroup has a set of "Proposers" and a set of "Voters." The "Proposers" set is composed of one or more Member Sets, while the "Voters" set is composed of one or more Member Sets, along with the weights of votes that are tied to each Member Set.

  The filtering criteria for each Member Set in a Workgroup can be configured by administrators. This enables them to determine who can propose and who can vote in that Workgroup. The criteria can be diverse and may include a whitelist, holding a specific Second-Level DID or SBT, holding a Second-Level DID associated with a particular NFT/Token, or custom code, among others.

  For "Voters", administrators can assign weightings to each Member Set when it's created, and the weighting assigned applies to all members in the Member Set. Community members can also delegate their voting rights to other members.

  ### 4. Blockchain Agnostic

  Voty is designed to be blockchain-agnostic for the following two reasons:

  - Not only crypto communities or those communities on a certain blockchain require a decentralized voting system
  - The governance method in Voty is based on DIDs, represented by .bit, which can be controlled by any private key of an asymmetric cryptography algorithm. This makes Voty capable of serving a wider range of communities.

  ### 5. Community engagement dashboard

  Voty provides a community engagement dashboard module for each community, which displays the frequency of proposals, the average voter turnout, and a list of active members, among other things. This data provides valuable insights that can be used to improve community development.

  ### 6. Open-source, no permission needed

  Voty should technically be referred to as the Voty Protocol as it outlines the basic structure and expansion options of this decentralized system. voty.xyz is an implementation of the Voty Protocol, serving as a complete and usable product.

  Both the Voty protocol and voty.xyz are open-source and require no permission, enabling anyone to develop their own implementation of the Voty Protocol instead of using voty.xyz. Additionally, anyone can participate in the development of the Voty Protocol through VIP (Voty Implementation Possibilities).

  ### 7. Permanent

  All data on voty.xyz is stored on Arweave. According to Arweave's statement, this allows for the permanent recording of a community's governance process, enabling us to review and understand the evolution and development of the community at any given time.

  ### 8. Transparent and unalterable

  The Voty Protocol has achieved the seemingly obvious but yet unaccomplished goal of being entirely transparent and unalterable through the use of blockchain technology.

  "Transparent" in Voty means that all rules, proposals, and each vote are publicly displayed. Any changes are traceable, and votes can not be maliciously undercounted.

  "Unalterable" in Voty means that all rules, proposals, and votes contain cryptographic signatures are stored on the blockchain. As a result, any fraudulent data can be easily identified and excluded.`}</MarkdownViewer>
          </Article>
        </Card>
      </Container>
    </>
  )
}

export const getStaticProps: GetStaticProps = () => {
  return { props: {} }
}
