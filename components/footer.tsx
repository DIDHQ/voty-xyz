export default function Footer() {
  return (
    <footer className="footer footer-center p-10 bg-base-200 text-base-content rounded">
      <div className="grid grid-flow-col gap-4">
        <a className="link link-hover">About</a>
        <a className="link link-hover">Docs</a>
        <a className="link link-hover">Twitter</a>
      </div>
      <div>
        <p>© {new Date().getFullYear()} Voty.xyz</p>
      </div>
    </footer>
  )
}
