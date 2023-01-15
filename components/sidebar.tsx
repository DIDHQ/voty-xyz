import { Fragment, ReactNode, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Bars3Icon, HomeIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { WalletIcon } from '@heroicons/react/20/solid'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import clsx from 'clsx'
import '@rainbow-me/rainbowkit/styles.css'

import useWallet from '../hooks/use-wallet'
import Avatar from './basic/avatar'
import Button from './basic/button'

const ConnectButtonCustom = dynamic(
  () =>
    import('@rainbow-me/rainbowkit').then(
      ({ ConnectButton }) => ConnectButton.Custom,
    ),
  { ssr: false },
)

const navigation = [
  { name: 'ph0ng.bit', href: '/ph0ng.bit', icon: HomeIcon, current: true },
]

export default function Sidebar(props: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { account, avatar, name } = useWallet()

  return (
    <div className="flex h-full">
      <Transition.Root show={mobileMenuOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-40 lg:hidden"
          onClose={setMobileMenuOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white focus:outline-none">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-4">
                    <button
                      type="button"
                      className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>
                <div className="pt-5 pb-4">
                  <div className="flex flex-shrink-0 items-center px-4">
                    <img
                      className="h-8 w-auto"
                      src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                      alt="Your Company"
                    />
                  </div>
                  <nav aria-label="Sidebar" className="mt-5">
                    <div className="space-y-1 px-2">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="group flex items-center rounded-md p-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        >
                          <item.icon
                            className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </nav>
                </div>
                <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
                  <ConnectButtonCustom>
                    {({ openConnectModal }) =>
                      account ? (
                        <Link
                          href="/settings"
                          className="group block flex-shrink-0"
                        >
                          <div className="flex items-center">
                            <div>
                              <Avatar
                                size={10}
                                name={name}
                                value={avatar}
                                className="inline-block"
                              />
                            </div>
                            <div className="ml-3">
                              <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                                {name}
                              </p>
                              <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
                                Account Settings
                              </p>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <Button primary onClick={openConnectModal}>
                          Connect Wallet
                        </Button>
                      )
                    }
                  </ConnectButtonCustom>
                </div>
              </Dialog.Panel>
            </Transition.Child>
            <div className="w-14 flex-shrink-0" aria-hidden="true">
              {/* Force sidebar to shrink to fit close icon */}
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex w-20 flex-col">
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-gray-800">
            <div className="flex-1">
              <Link
                href="/"
                className="flex items-center justify-center bg-indigo-700 py-4"
              >
                <img
                  className="h-8 w-auto"
                  src="https://tailwindui.com/img/logos/mark.svg?color=white"
                  alt="Your Company"
                />
              </Link>
              <nav
                aria-label="Sidebar"
                className="flex flex-col items-center space-y-3 py-6"
              >
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      item.current
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-400 hover:bg-gray-700',
                      'flex-shrink-0 inline-flex items-center justify-center h-14 w-14 rounded-lg',
                    )}
                  >
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                    <span className="sr-only">{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex flex-shrink-0 pb-5">
              <ConnectButtonCustom>
                {({ openConnectModal }) =>
                  account ? (
                    <Link
                      href="/settings"
                      className="w-full flex-shrink-0"
                      shallow
                    >
                      <Avatar
                        size={10}
                        name={name}
                        value={avatar}
                        className="mx-auto block"
                      />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={openConnectModal}
                      className="mx-auto inline-flex items-center rounded-full border border-transparent bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <WalletIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  )
                }
              </ConnectButtonCustom>
              <div className="sr-only">
                <p>{name}</p>
                <p>Account settings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile top navigation */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between bg-indigo-600 py-2 px-4 sm:px-6 lg:px-8">
            <Link href="/">
              <img
                className="h-8 w-auto"
                src="https://tailwindui.com/img/logos/mark.svg?color=white"
                alt="Your Company"
              />
            </Link>
            <div>
              <button
                type="button"
                className="-mr-3 inline-flex h-12 w-12 items-center justify-center rounded-md bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        {/* <main className="flex flex-1 overflow-hidden">
          <section
            aria-labelledby="primary-heading"
            className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto lg:order-last"
          >
            <h1 id="primary-heading" className="sr-only">
              Account
            </h1>
            {props.children[0]}
          </section>
          <aside className="hidden lg:order-first lg:block lg:flex-shrink-0">
            <div className="relative flex h-full w-96 flex-col overflow-y-auto border-r border-gray-200 bg-white">
              {props.children[1]}
            </div>
          </aside>
        </main> */}
        {props.children}
      </div>
    </div>
  )
}
