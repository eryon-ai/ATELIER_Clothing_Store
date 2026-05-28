import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant mt-xl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter px-margin-desktop py-xl max-w-8xl mx-auto">
        {/* Brand */}
        <div className="md:col-span-4">
          <Link to="/" className="font-headline-md text-headline-md font-bold text-primary mb-6 block tracking-tighter">
            ATELIER
          </Link>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6 max-w-xs">
            Crafting a new paradigm of luxury through disciplined design and architectural silhouettes.
          </p>
          <div className="flex gap-md">
            <a href="#" aria-label="Instagram" className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">camera</span>
            </a>
            <a href="#" aria-label="Website" className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">public</span>
            </a>
            <a href="#" aria-label="Video" className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">video_library</span>
            </a>
          </div>
        </div>

        {/* Explore */}
        <div className="md:col-span-2">
          <h4 className="font-label-md text-label-md uppercase text-primary mb-6">Explore</h4>
          <ul className="space-y-4">
            {[
              { label: 'New Arrivals', href: '/collections/new-arrivals' },
              { label: 'Collections', href: '/products' },
              { label: 'Editorial', href: '/editorial' },
              { label: 'Sizing Guide', href: '#' },
            ].map(l => (
              <li key={l.label}>
                <Link to={l.href} className="font-body-md text-body-md text-on-surface-variant hover:text-secondary transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div className="md:col-span-2">
          <h4 className="font-label-md text-label-md uppercase text-primary mb-6">Company</h4>
          <ul className="space-y-4">
            {[
              { label: 'Sustainability', href: '#' },
              { label: 'Shipping & Returns', href: '#' },
              { label: 'Privacy Policy', href: '#' },
              { label: 'Terms of Service', href: '#' },
            ].map(l => (
              <li key={l.label}>
                <Link to={l.href} className="font-body-md text-body-md text-on-surface-variant hover:text-secondary transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div className="md:col-span-4">
          <h4 className="font-label-md text-label-md uppercase text-primary mb-6">Newsletter</h4>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            Join the ATELIER circle for early access and editorial insights.
          </p>
          {subscribed ? (
            <p className="font-label-md text-secondary uppercase tracking-widest">
              ✓ Welcome to the circle.
            </p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex border-b border-primary">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email Address"
                className="bg-transparent border-none focus:ring-0 w-full py-2 font-body-md outline-none"
                required
              />
              <button type="submit" className="font-label-md text-label-md uppercase tracking-widest px-4 hover:text-secondary transition-colors">
                Join
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="px-margin-desktop py-md border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-4 max-w-8xl mx-auto">
        <p className="font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase">
          © 2024 ATELIER STUDIOS. ALL RIGHTS RESERVED.
        </p>
        <div className="flex gap-md">
          <a href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">Terms</a>
          <a href="#" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">Cookies</a>
        </div>
      </div>
    </footer>
  )
}
