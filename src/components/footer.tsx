import Link from "next/link"
import { ArrowUpRightIcon } from "@heroicons/react/24/outline"
import { tv } from 'tailwind-variants'
import { ElementType } from 'react'
import { clsxMerge } from "../utils/tailwind-helper"
import { twitterHandle } from '../utils/constants'
import { DiscordIcon, DotbitIcon, SubscriptionIcon, TwitterIcon, VotyIcon } from "./icons"

const productLinks = [{
  title: '.bit',
  external: true,
  href: 'https://www.did.id/'
}, {
  title: 'd.id Profile',
  external: true,
  href: 'https://d.id/'
}, {
  title: 'Voty',
  external: true,
  href: 'https://voty.xyz/'
}, {
  title: 'SoulFrag',
  external: true,
  href: 'https://www.soulfrag.xyz/'
}]

const companyLinks = [{
  title: 'Join Us',
  external: true,
  href: 'https://www.did.id/',
  hasArrow: true
}, {
  title: 'Terms',
  external: true,
  href: 'https://d.id/',
  hasArrow: true
}, {
  title: 'Brand Kit',
  external: true,
  href: 'https://voty.xyz/',
  hasArrow: true
}]

const socialLinks = [{
  href: `https://twitter.com/${twitterHandle}`,
  icon: TwitterIcon,
  title: 'Follow d.id',
  subtitle: ' on Twitter'
}, {
  href: '',
  icon: SubscriptionIcon,
  title: 'Subscribe blog',
  subtitle: ' for updates'
}, {
  href: 'https://www.did.id/',
  icon: DotbitIcon,
  title: 'Join our Community'
}, {
  href: 'https://discord.gg/8P6vSwwMzk',
  icon: DiscordIcon,
  title: 'Join our Discord'
}]

export default function Footer(props: {
  className?: string
}) {
  const {
    className
  } = props
  
  return (
    <footer
      className={clsxMerge(
        'pb-safe',
        className
      )}>
      <div
        className="mx-auto w-full max-w-7xl px-3 py-16 md:px-6 lg:px-8">
        <div
          className="flex flex-col justify-between gap-8 md:gap-12 lg:flex-row">
          <div
            className="max-w-xs">
            <Link 
              className="group flex"
              href="/" 
              title='Voty'>
              <h1>
                <VotyIcon 
                  className="h-[27px] text-primary-500 transition group-hover:text-primary-600" />
              </h1>
            </Link>
              
            <p
              className="mt-6 text-base text-subtle">
              d.id Team leverages decentralized identity to empower identity building and community growth.
            </p>
          </div>
          
          <div
            className="flex gap-12 max-[370px]:flex-col min-[370px]:max-sm:grid min-[370px]:max-sm:grid-cols-2 sm:max-lg:justify-between lg:gap-18 min-[1160px]:gap-24">
            <FooterNav
              title="Product"
              links={productLinks} />
              
            <FooterNav
              title="Company"
              links={companyLinks} />
              
            <FooterColumn
              className="min-[370px]:max-sm:col-span-2"
              title="Find Us">
              <ul
                className="space-y-2">
                {socialLinks.map((item, index) => 
                  <li
                    key={index}>
                    <SocialLink 
                      href={item.href}
                      icon={item.icon}
                      title={item.title}
                      subtitle={item.subtitle} />
                  </li>
                )}
              </ul>
            </FooterColumn>
          </div>
        </div>
        
        <div
          className="mt-32 text-center text-sm text-subtle">
          Copyright © 2023 d.id Team
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
    link: 'inline-flex items-center text-base font-medium text-moderate hover:text-strong',
    arrow: 'ml-1 h-2 w-2 stroke-2'
  }
})

const { link: navLinkClass, arrow: navArrowClass } = navClass()

export function FooterColumn(props: {
  title: string
  className?: string
  children?: React.ReactNode
}) {
  const {
    title,
    className,
    children
  } = props
  
  return (
    <div
      className={clsxMerge(
        '',
        className
      )}>
      <h4
        className="mb-4 text-lg-semibold text-strong">
        {title}
      </h4>
      
      {children}
    </div>
  )
}

export function FooterNav(props: {
  title: string
  links: Link[]
}) {
  const {
    title,
    links
  } = props
  
  return (
    <FooterColumn
      title={title}>
      <ul
        className="space-y-5">
        {links.map((item, index) => 
          <li
            key={index}>
            {item.external ? (
              <a
                className={navLinkClass()}
                href={item.href}
                target="_blank"
                title={item.title}>
                <span>
                  {item.title}
                </span>
                
                {item.hasArrow ? (
                  <ArrowUpRightIcon 
                  className={navArrowClass()} />
                ) : null}
              </a>
            ) : (
              <Link
                className={navLinkClass()}
                href={item.href}>
                {item.title}
              </Link>
            )}
          </li>
        )}
      </ul>
    </FooterColumn>
  )
}

export function SocialLink (props: {
  href: string
  icon: ElementType<{ className?: string }>
  title: string
  subtitle?: string
  className?: string
}) {
  const {
    href,
    icon: Icon,
    title,
    subtitle,
    className
  } = props
  
  return (
    <a
      className={clsxMerge(
        'group flex items-center bg-subtle rounded-[22px] h-11 pl-3 pr-5 gap-2',
        className
      )}
      href={href}
      target="_blank"
      title={title}>
      <Icon 
        className="transition-transform group-hover:scale-110" />
      
      <div
        className="text-sm font-medium">
        <span
          className="text-strong">
          {title}
        </span>
        
        {subtitle ? (
          <span
            className="text-subtle">
            {subtitle}
          </span>
        ) : null}
      </div>
    </a>
  )
}