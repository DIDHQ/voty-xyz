import { IntermediateMode, Moon, Sun } from '@icon-park/react'
import { useAtom } from 'jotai'
import { Button, ButtonGroup } from 'react-daisyui'

import { persistentThemeAtom } from '../src/atoms'

export default function ThemeSwitcher() {
  const [persistentTheme, setPersistentTheme] = useAtom(persistentThemeAtom)

  return (
    <ButtonGroup>
      <Button
        active={persistentTheme === 'light'}
        startIcon={<Sun />}
        onClick={() => setPersistentTheme('light')}
      >
        Light
      </Button>
      <Button
        active={persistentTheme === 'dark'}
        startIcon={<Moon />}
        onClick={() => setPersistentTheme('dark')}
      >
        Dark
      </Button>
      <Button
        active={persistentTheme === 'auto'}
        startIcon={<IntermediateMode />}
        onClick={() => setPersistentTheme('auto')}
      >
        Auto
      </Button>
    </ButtonGroup>
  )
}
