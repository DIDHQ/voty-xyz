import { atomWithStorage } from 'jotai/utils'

export const persistentThemeAtom = atomWithStorage<'light' | 'dark' | 'auto'>(
  'theme',
  'auto',
)
