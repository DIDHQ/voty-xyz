import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { Community } from './schemas/community'

export const showBannerAtom = atomWithStorage('showBanner', true)

export const previewCommunityAtom = atom<
  | (Community & { from: string; to: string; author: string; template: string })
  | undefined
>(undefined)
