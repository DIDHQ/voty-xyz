import { CubeIcon, CubeTransparentIcon } from '@heroicons/react/24/outline'

import useStatus from '../hooks/use-status'
import { permalink2Url } from '../src/arweave'
import TextButton from './basic/text-button'

export default function Status(props: { permalink?: string }) {
  const { data: status } = useStatus(props.permalink)

  return (
    <TextButton
      onClick={() => {
        if (props.permalink) {
          window.open(permalink2Url(props.permalink))
        }
      }}
    >
      {status?.timestamp ? (
        <CubeIcon className="h-5 w-5" />
      ) : (
        <CubeTransparentIcon className="h-5 w-5" />
      )}
    </TextButton>
  )
}
