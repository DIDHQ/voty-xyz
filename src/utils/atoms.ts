import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { Community } from './schemas/community'
import { Proposal } from './schemas/proposal'
import { Option } from './schemas/option'
import { Preview } from './types'

export const showBannerAtom = atomWithStorage('showBanner', true)

export const previewCommunityAtom = atom<
  (Community & { preview: Preview }) | undefined
>(undefined)

export const previewProposalAtom = atom<
  (Proposal & { preview: Preview }) | undefined
>(undefined)

export const previewOptionAtom = atom<
  (Option & { preview: Preview }) | undefined
>(undefined)
