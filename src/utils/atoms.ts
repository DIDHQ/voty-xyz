import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { Community } from './schemas/v1/community'
import { Grant } from './schemas/v1/grant'
import { GrantProposal } from './schemas/v1/grant-proposal'
import { Group } from './schemas/v1/group'
import { GroupProposal } from './schemas/v1/group-proposal'
import { Preview } from './types'

export const showBannerAtom = atomWithStorage('showBanner', true)

export const previewCommunityAtom = atom<
  (Community & { preview: Preview }) | undefined
>(undefined)

export const previewGrantAtom = atom<
  (Grant & { preview: Preview }) | undefined
>(undefined)

export const previewGrantProposalAtom = atom<
  (GrantProposal & { preview: Preview }) | undefined
>(undefined)

export const previewGroupAtom = atom<
  (Group & { preview: Preview }) | undefined
>(undefined)

export const previewGroupProposalAtom = atom<
  (GroupProposal & { preview: Preview }) | undefined
>(undefined)
