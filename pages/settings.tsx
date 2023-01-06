import FormItem from '../components/form-item'
import ThemeSwitcher from '../components/theme-switcher'

export default function SettingsPage() {
  return (
    <>
      <FormItem label="Theme">
        <ThemeSwitcher />
      </FormItem>
    </>
  )
}
