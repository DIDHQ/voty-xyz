import { CheckIcon, ShareIcon } from '@heroicons/react/24/outline'
import { useCallback, useState } from 'react'

import TextButton from './basic/text-button'
import Tooltip from './basic/tooltip'

export default function ShareLinkIcon(props: {
  link: string
  className: string
}) {
  const [copied, setCopied] = useState(false)
  const handleClick = useCallback(() => {
    navigator.clipboard.writeText(props.link)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 5000)
  }, [props.link])

  return (
    <TextButton primary onClick={handleClick} className={props.className}>
      <Tooltip
        place="top"
        text={copied ? 'Copied to your clipboard' : 'Click to copy share link'}
      >
        {copied ? (
          <CheckIcon className="h-5 w-5" />
        ) : (
          <ShareIcon className="h-5 w-5" />
        )}
      </Tooltip>
    </TextButton>
  )
}
