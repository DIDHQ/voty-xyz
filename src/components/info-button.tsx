import { Menu } from '@headlessui/react'
import {
  BookOpenIcon,
  EllipsisVerticalIcon,
  InformationCircleIcon,
} from '@heroicons/react/20/solid'
import { clsx } from 'clsx'
import Link from 'next/link'

import { twitterHandle } from '../utils/constants'
import Dropdown from './basic/dropdown'
import { DiscordIcon, DotbitIcon, GitHubIcon, TwitterIcon } from './icons'

export default function InfoButton() {
  return (
    <Dropdown
      trigger={
        <div
          className={clsx(
            'flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-200',
          )}
        >
          <EllipsisVerticalIcon className="h-6 w-6 text-gray-600 hover:text-gray-700" />
        </div>
      }
    >
      <div className="py-1">
        <Menu.Item>
          {({ active }) => (
            <Link
              href="/about"
              className={clsx(
                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                'group flex items-center px-4 py-2 text-sm',
              )}
            >
              <InformationCircleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              About
            </Link>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <a
              href="https://voty.gitbook.io/"
              className={clsx(
                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                'group flex items-center px-4 py-2 text-sm',
              )}
            >
              <BookOpenIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Document
            </a>
          )}
        </Menu.Item>
      </div>
      <div className="py-1">
        <Menu.Item>
          {({ active }) => (
            <a
              href="https://www.did.id/"
              className={clsx(
                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                'group flex items-center px-4 py-2 text-sm',
              )}
            >
              <DotbitIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              .bit
            </a>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <a
              href="https://github.com/VotyXYZ/voty-xyz"
              className={clsx(
                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                'group flex items-center px-4 py-2 text-sm',
              )}
            >
              <GitHubIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              GitHub
            </a>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <a
              href={`https://twitter.com/${twitterHandle}`}
              className={clsx(
                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                'group flex items-center px-4 py-2 text-sm',
              )}
            >
              <TwitterIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Twitter
            </a>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <a
              href="https://discord.gg/8P6vSwwMzk"
              className={clsx(
                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                'group flex items-center px-4 py-2 text-sm',
              )}
            >
              <DiscordIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Discord
            </a>
          )}
        </Menu.Item>
      </div>
    </Dropdown>
  )
}
