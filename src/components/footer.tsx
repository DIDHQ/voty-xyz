import Link from 'next/link'
import { tv } from 'tailwind-variants'
import { ElementType } from 'react'
import { clsxMerge } from '../utils/tailwind-helper'
import { twitterHandle } from '../utils/constants'
import {
  ArrowRightUpIcon,
  DiscordIcon,
  DotbitTextIcon,
  PadgeIcon,
  SubscriptionIcon,
  TwitterIcon,
  VotyFirstLetterIcon,
  VotyIcon,
} from './icons'

const productLinks = [
  {
    title: '.bit',
    icon: DotbitTextIcon,
    external: true,
    href: 'https://d.id/id-protocol/bit',
  },
  {
    title: 'Padge',
    icon: PadgeIcon,
    external: true,
    href: 'https://padge.com',
  },
]

const developerLinks = [
  {
    title: 'GitHub',
    external: true,
    href: 'https://github.com/DIDHQ/voty-xyz',
  },
  {
    title: 'Documents',
    external: true,
    href: 'https://community.d.id/c/knowledge-base-voty/',
  },
]

const socialLinks = [
  {
    href: `https://twitter.com/${twitterHandle}`,
    icon: TwitterIcon,
    title: 'Follow Voty',
    subtitle: ' on Twitter',
  },
  {
    href: 'https://blog.d.id/',
    icon: SubscriptionIcon,
    title: 'Subscribe blog',
    subtitle: ' for updates',
  },
  {
    href: 'https://community.d.id/c/welcome',
    icon: VotyFirstLetterIcon,
    title: 'Join our Community',
  },
  {
    href: 'https://discord.gg/8P6vSwwMzk',
    icon: DiscordIcon,
    title: 'Join our Discord',
  },
]

export default function Footer(props: { className?: string }) {
  const { className } = props

  return (
    <footer className={clsxMerge('pb-safe', className)}>
      <div className="mx-auto w-full max-w-7xl px-3 pb-[60px] pt-16 md:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-12 lg:flex-row">
          <div className="max-w-xs">
            <Link className="group flex" href="/" title="Voty">
              <h1>
                <VotyIcon className="h-[25px] text-primary-500 transition group-hover:text-primary-600" />
              </h1>
            </Link>

            <p className="mt-6 text-base text-subtle">
              Voice of your community
            </p>

            <img
              className="mt-6 h-[41px] w-[auto]"
              src="/images/web3-accessibility-badge.png"
              alt="Web3 Accessibility"
            />
          </div>

          <div className="flex gap-12 max-[370px]:flex-col min-[370px]:max-sm:grid min-[370px]:max-sm:grid-cols-2 sm:max-lg:justify-between lg:gap-18 min-[1160px]:gap-24">
            <FooterNav title="Developer" links={developerLinks} />
            <FooterColumn
              className="min-[370px]:max-sm:col-span-2"
              title="Find us"
            >
              <ul className="space-y-2">
                {socialLinks.map((item, index) => (
                  <li key={index}>
                    <SocialLink
                      href={item.href}
                      icon={item.icon}
                      title={item.title}
                      subtitle={item.subtitle}
                    />
                  </li>
                ))}
              </ul>
            </FooterColumn>
          </div>
        </div>

        <div className="mt-[100px] flex flex-col-reverse items-center gap-6 lg:flex-row lg:justify-between">
          <div className="text-sm font-medium text-footer-color">
            Copyright © {new Date().getFullYear()} Built by d.id Team
          </div>

          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <p className="text-sm font-medium text-footer-color">
              More Products by d.id:
            </p>

            {productLinks.map((item) => (
              <a
                className="flex items-center text-footer-color transition hover:text-strong"
                key={item.title}
                href={item.href}
                target="_blank"
                title={item.title}
              >
                <item.icon />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

interface Link {
  title: string
  href: string
  external?: boolean
  hasArrow?: boolean
}

const navClass = tv({
  slots: {
    link: 'inline-flex items-center text-base font-medium text-strong hover:text-primary-500',
    arrow: 'ml-1 h-[6px] w-[6px] text-moderate',
  },
})

const { link: navLinkClass, arrow: navArrowClass } = navClass()

export function FooterColumn(props: {
  title: string
  className?: string
  children?: React.ReactNode
}) {
  const { title, className, children } = props

  return (
    <div className={clsxMerge('', className)}>
      <h4 className="mb-4 text-lg-semibold text-strong">{title}</h4>

      {children}
    </div>
  )
}

export function FooterNav(props: { title: string; links: Link[] }) {
  const { title, links } = props

  return (
    <FooterColumn title={title}>
      <ul className="space-y-5">
        {links.map((item, index) => (
          <li key={index}>
            {item.external ? (
              <a
                className={navLinkClass()}
                href={item.href}
                target="_blank"
                title={item.title}
              >
                <span>{item.title}</span>

                {item.hasArrow ? (
                  <ArrowRightUpIcon className={navArrowClass()} />
                ) : null}
              </a>
            ) : (
              <Link className={navLinkClass()} href={item.href}>
                {item.title}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </FooterColumn>
  )
}

export function SocialLink(props: {
  href: string
  icon: ElementType<{ className?: string }>
  title: string
  subtitle?: string
  className?: string
}) {
  const { href, icon: Icon, title, subtitle, className } = props

  return (
    <a
      className={clsxMerge(
        'group flex items-center bg-subtle rounded-[22px] h-11 pl-3 pr-5 gap-2',
        className,
      )}
      href={href}
      target="_blank"
      title={title}
    >
      <Icon className="transition-transform group-hover:scale-110" />

      <div className="text-sm font-medium">
        <span className="text-strong">{title}</span>

        {subtitle ? <span className="text-subtle">{subtitle}</span> : null}
      </div>
    </a>
  )
}
