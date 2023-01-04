import { useCallback } from 'react'
import { useSetAtom } from 'jotai'
import { Dropdown, Button } from 'react-daisyui'
import { Theme } from '@icon-park/react'
import { capitalize } from 'lodash'

import { persistentThemeAtom } from '../src/atoms'

const DEFAULT_THEMES = ['light', 'dark', 'auto']

export default function ThemeSwitcher() {
  const setPersistentTheme = useSetAtom(persistentThemeAtom)

  // To make sure clicking button will make the menu closed if the menu is open.
  const handleCheckAndCloseDropDown = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      let targetEl = e.currentTarget
      if (targetEl && targetEl.matches(':focus')) {
        setTimeout(function () {
          targetEl.blur()
        }, 0)
      }
    },
    [],
  )

  return (
    <Dropdown>
      <Button
        variant="outline"
        shape="circle"
        onMouseDown={handleCheckAndCloseDropDown}
      >
        <Theme />
      </Button>
      <Dropdown.Menu className="w-52">
        {DEFAULT_THEMES.map((theme) => (
          <Dropdown.Item
            key={theme}
            onClick={() =>
              setPersistentTheme(theme as 'light' | 'dark' | 'auto')
            }
          >
            {capitalize(theme)}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  )
}
