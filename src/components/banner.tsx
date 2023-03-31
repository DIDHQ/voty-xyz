import { XMarkIcon } from '@heroicons/react/20/solid'
import { useAtom } from 'jotai'

import { showBannerAtom } from '../utils/atoms'
import TextButton from './basic/text-button'

export default function Banner() {
  const [showBanner, setShowBanner] = useAtom(showBannerAtom)

  return showBanner ? (
    <div className="z-50 flex items-center gap-x-6 bg-primary-600 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
      <p className="text-sm leading-6 text-white">
        Data will not be retained after Alpha testing.&nbsp;
        <a href="https://discord.gg/8P6vSwwMzk">
          Join our Discord to feedback and get future SBT airdrop!&nbsp;
          <span aria-hidden="true">&rarr;</span>
        </a>
      </p>
      <div className="flex flex-1 justify-end">
        <TextButton
          onClick={() => setShowBanner(false)}
          className="-m-3 p-3 focus-visible:outline-offset-[-4px]"
        >
          <XMarkIcon className="h-5 w-5 text-white" aria-hidden="true" />
        </TextButton>
      </div>
    </div>
  ) : null
}
