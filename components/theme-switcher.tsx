import { useAtom } from 'jotai'
import { Dropdown, Button } from 'react-daisyui'
import { Theme } from '@icon-park/react'

import { persistentThemeAtom } from '../src/atoms'

const DEFAULT_THEMES = ['light', 'dark', 'auto']

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function ThemeSwitcher() {
  const [persistentTheme, setPersistentTheme] = useAtom(persistentThemeAtom)
  const handleChangeThemeGen = (theme: 'light' | 'dark' | 'auto') => () => {
    setPersistentTheme(theme)
  }

  return (
    <Dropdown>
      <Button variant="outline" shape="circle">
        <Theme />
      </Button>
      <Dropdown.Menu className="w-52">
        {DEFAULT_THEMES.map((theme) => (
          <Dropdown.Item
            key={theme}
            onClick={handleChangeThemeGen(theme as 'light' | 'dark' | 'auto')}
          >
            {capitalize(theme)}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  )
}
