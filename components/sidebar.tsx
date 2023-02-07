import Link from 'next/link'

export default function Sidebar() {
  return (
    <nav className="flex h-screen w-18 shrink-0 flex-col items-center gap-3 border-r py-3">
      <Link
        href="/"
        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border"
      >
        <img
          src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
          alt="LOGO"
          className="h-8 w-auto"
        />
      </Link>
      <hr className="w-full border-t-0 border-b" />
    </nav>
  )
}
