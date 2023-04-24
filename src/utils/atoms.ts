import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { Community } from './schemas/community'
import { Group } from './schemas/group'
import { Proposal } from './schemas/proposal'
import { Preview } from './types'

export const showBannerAtom = atomWithStorage('showBanner', true)

export const previewCommunityAtom = atom<
  (Community & { preview: Preview }) | undefined
>(undefined)

export const previewGroupAtom = atom<
  (Group & { preview: Preview }) | undefined
>(undefined)

export const previewProposalAtom = atom<
  (Proposal & { preview: Preview }) | undefined
>(undefined)
