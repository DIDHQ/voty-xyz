import Link from 'next/link'

export default function Sidebar() {
  return (
    <aside className="fixed left-0 z-50 flex h-screen w-18 flex-col items-center border-r">
      <Link
        href="/"
        className="flex h-18 w-18 cursor-pointer items-center justify-center border-b"
      >
        <img
          src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
          alt="LOGO"
          className="h-8 w-auto"
        />
      </Link>
    </aside>
  )
}
