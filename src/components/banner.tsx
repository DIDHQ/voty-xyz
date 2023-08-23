import { XMarkIcon } from '@heroicons/react/20/solid'
import { useAtom } from 'jotai'

import { showBannerAtom } from '../utils/atoms'
import TextButton from './basic/text-button'

export default function Banner() {
  const [showBanner, setShowBanner] = useAtom(showBannerAtom)

  return showBanner ? (
    <div 
      className="flex items-center justify-between gap-5 bg-primary-600 px-3 py-2 sm:px-8 sm:before:flex-1">
      <p 
        className="text-sm leading-6 text-white">
        Having questions about Voty?&nbsp;
        <a
          href="https://dasfoundation.larksuite.com/scheduler/0a94c1dbf33aa9ce"
          className="underline">
          Schedule a demo with us&nbsp;
          <span aria-hidden="true">&rarr;</span>
        </a>
      </p>
      
      <div
        className="flex flex-1 justify-end">
        <TextButton
          onClick={() => setShowBanner(false)}>
          <XMarkIcon 
            className="h-5 w-5 text-white" 
            aria-hidden="true" />
        </TextButton>
      </div>
    </div>
  ) : null
}
