export default function Footer() {
  const currentYear = new Date().getFullYear()
  return (
    <footer className="footer footer-center p-10 bg-base-200 text-base-content rounded">
      <div className="grid grid-flow-col gap-4">
        <a className="link link-hover">About</a>
        <a className="link link-hover">Docs</a>
        <a className="link link-hover">Twitter</a>
      </div>
      <div>
        <p>Copyright © {currentYear} - All right reserved by Voty.xyz</p>
      </div>
    </footer>
  )
}
