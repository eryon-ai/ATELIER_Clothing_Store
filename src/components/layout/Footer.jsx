import { Link } from 'react-router-dom'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
      toast.success('Welcome to the ATELIER circle.')
    }
  }

  const showComingSoon = (e, feature) => {
    e.preventDefault()
    toast(`${feature} coming soon`, { icon: '⏳' })
  }

  const footerLinks = {
    Collections: [
      { label: 'New Arrivals', href: '/collections/new-arrivals' },
      { label: 'Best Sellers', href: '/collections/best-sellers' },
      { label: 'Women', href: '/collections/women' },
      { label: 'Men', href: '/collections/men' },
      { label: 'Sale', href: '/collections/sale' },
    ],
    'Customer Service': [
      { label: 'Track Order', href: '#', fn: 'Track Order' },
      { label: 'Returns & Exchanges', href: '#', fn: 'Returns & Exchanges' },
      { label: 'Size Guide', href: '#', fn: 'Size Guide' },
      { label: 'Contact Us', href: '#', fn: 'Contact Us' },
    ],
    Company: [
      { label: 'About ATELIER', href: '#', fn: 'About' },
      { label: 'Sustainability', href: '#', fn: 'Sustainability' },
      { label: 'Privacy Policy', href: '#', fn: 'Privacy Policy' },
      { label: 'Terms of Service', href: '#', fn: 'Terms of Service' },
    ],
  }

  return (
    <footer className="bg-white border-t border-[#EAEAEA] mt-16 pb-[90px] md:pb-0">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-12 md:py-16">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-8 pb-12 border-b border-[#EAEAEA]">
          
          {/* Brand Column */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 bg-[#111111] rounded-full flex items-center justify-center">
                <span className="text-white text-[11px] font-bold uppercase">A</span>
              </div>
              <span className="font-semibold text-[17px] text-[#111111] tracking-tight">ATELIER</span>
            </Link>
            <p className="text-[13px] text-[#666666] leading-relaxed mb-6 max-w-[260px]">
              Crafting a new paradigm of luxury through disciplined design and architectural silhouettes.
            </p>
            {/* Newsletter */}
            <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#111111] mb-3">Newsletter</h4>
            {subscribed ? (
              <p className="text-[13px] text-emerald-600 font-medium">✓ Welcome to the circle.</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 bg-[#F5F5F5] border border-[#EAEAEA] rounded-full px-4 py-2.5 text-[13px] outline-none focus:border-[#111111] transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#111111] text-white px-5 py-2.5 rounded-full text-[12px] font-semibold hover:opacity-80 transition-opacity whitespace-nowrap"
                >
                  Join
                </button>
              </form>
            )}
            {/* Social */}
            <div className="flex gap-3 mt-6">
              {['camera', 'public', 'video_library'].map((icon, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => showComingSoon(e, ['Instagram', 'Website', 'Video'][i])}
                  className="w-9 h-9 bg-[#F5F5F5] rounded-full flex items-center justify-center hover:bg-[#EAEAEA] transition-colors"
                >
                  <span className="material-symbols-outlined text-[#666666]" style={{ fontSize: 17 }}>{icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#111111] mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map(l => (
                  <li key={l.label}>
                    {l.href === '#' ? (
                      <a
                        href="#"
                        onClick={(e) => showComingSoon(e, l.fn)}
                        className="text-[13px] text-[#666666] hover:text-[#111111] transition-colors"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        to={l.href}
                        className="text-[13px] text-[#666666] hover:text-[#111111] transition-colors"
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-center md:text-left">
          <p className="text-[11px] text-[#999999]">
            © 2024 ATELIER STUDIOS. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Cookies'].map(item => (
              <a
                key={item}
                href="#"
                onClick={(e) => showComingSoon(e, item)}
                className="text-[11px] text-[#999999] hover:text-[#111111] transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
