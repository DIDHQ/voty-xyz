import { Menu, Transition } from '@headlessui/react'
import { Fragment, ReactNode } from 'react'

export default function Dropdown(props: {
  trigger: ReactNode
  children: ReactNode
}) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="flex items-center">{props.trigger}</Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl border border-base/40 bg-white p-3 shadow-lg focus:outline-none">
          {props.children}
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
