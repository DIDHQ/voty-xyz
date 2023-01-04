import { useAtom } from 'jotai'
import { Select } from 'react-daisyui'
import { persistentThemeAtom } from '../src/atoms'

export default function ThemeSwitcher() {
  const [persistentTheme, setPersistentTheme] = useAtom(persistentThemeAtom)

  return (
    <Select
      value={persistentTheme}
      onChange={(e) =>
        setPersistentTheme(e.target.value as 'light' | 'dark' | 'auto')
      }
    >
      {['light', 'dark', 'auto'].map((mode) => (
        <Select.Option key={mode} value={mode}>
          {mode}
        </Select.Option>
      ))}
    </Select>
  )
}
