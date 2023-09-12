import dynamic from 'next/dynamic'
import Link from 'next/link'
import { tv } from 'tailwind-variants'
import { usePathname } from 'next/navigation'
import { isTestnet } from '../utils/constants'
import { clsxMerge } from '../utils/tailwind-helper'
import { VotyIcon } from './icons'


const ConnectButton = dynamic(() => import('./connect-button'), { ssr: false })

const navItemClass = tv({
  base: 'text-sm font-medium text-moderate transition hover:text-primary-500',
})

export default function Header(props: { className?: string }) {
  const pathname = usePathname()

  return (
    <header
      className={clsxMerge('w-full justify-center pt-safe', props.className)}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-7 px-3 sm:h-20 sm:gap-12 md:px-6 lg:px-8">
        <Link className="group flex pt-px" href="/" title="Voty">
          <h1>
            <VotyIcon className="h-6 text-[#121314] transition group-hover:text-primary-500 sm:h-full" />
          </h1>

          {/* {isTestnet ? (
            <span 
              className="relative top-[-6px] ml-1 hidden scale-95 text-xs text-primary-500 sm:block">
              Testnet
            </span>
          ) : (
            <span 
              className="relative top-[-6px] ml-1 hidden scale-95 text-xs text-primary-500 sm:block">
              Beta
            </span>
          )} */}
        </Link>

        <nav className="flex flex-1 items-center gap-4 sm:gap-8">
          <a
            className={navItemClass()}
            href={
              isTestnet
                ? 'https://test.d.id/products/voty'
                : 'https://d.id/products/voty'
            }
            title="About"
          >
            About
          </a>

          <Link
            className={clsxMerge(
              navItemClass(),
              pathname === '/lite-paper' ? 'text-strong' : '',
            )}
            href="/lite-paper"
            title="Lite Paper"
          >
            Lite Paper
          </Link>

          <a
            className={navItemClass()}
            href="https://voty.gitbook.io/"
            title="Document"
          >
            Document
          </a>
        </nav>

        <div className="flex shrink-0">
          <ConnectButton />
        </div>
      </div>
    </header>
  )
}
