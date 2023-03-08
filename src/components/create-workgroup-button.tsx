import { PlusIcon } from '@heroicons/react/20/solid'

import useIsManager from '../hooks/use-is-manager'
import TextButton from './basic/text-button'

export default function CreateWorkgroupButton(props: {
  entry?: string
  className?: string
}) {
  const isManager = useIsManager(props.entry)

  return isManager ? (
    <TextButton
      primary
      href={`/${props.entry}/create`}
      className={props.className}
    >
      <PlusIcon className="h-5 w-5" />
    </TextButton>
  ) : null
}
