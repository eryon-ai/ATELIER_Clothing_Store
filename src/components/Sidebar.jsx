import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const SCREENS = [
  { path: '/', label: 'Home — Highly Detailed', file: 'home-detailed.html', tag: 'DARK' },
  { path: '/home-light', label: 'Home — Light Theme', file: 'home-light.html', tag: 'LIGHT' },
  { path: '/editorial-home', label: 'Cinematic Editorial Home', file: 'editorial-home.html', tag: 'LIGHT' },
  { path: '/pdp', label: 'Premium PDP', file: 'pdp.html', tag: 'LIGHT' },
  { path: '/parka', label: 'Metropolis Parka', file: 'parka.html', tag: 'LIGHT' },
  { path: '/cart', label: 'Cart & Checkout', file: 'cart.html', tag: 'LIGHT' },
  { path: '/cart-premium', label: 'Premium Cart & Checkout', file: 'cart-premium.html', tag: 'LIGHT' },
  { path: '/women', label: "Women's Collection", file: 'women.html', tag: 'DARK' },
  { path: '/men', label: "Men's Collection", file: 'men.html', tag: 'DARK' },
  { path: '/sneakers', label: 'Sneakers & Kicks', file: 'sneakers.html', tag: 'DARK' },
  { path: '/footwear', label: 'Footwear Collection', file: 'footwear.html', tag: 'DARK' },
  { path: '/accessories', label: 'Accessories Collection', file: 'accessories.html', tag: 'DARK' },
  { path: '/oversized', label: 'Oversized Collection', file: 'oversized.html', tag: 'DARK' },
  { path: '/premium', label: 'Premium Collection', file: 'premium.html', tag: 'DARK' },
  { path: '/best-sellers', label: 'Best Sellers', file: 'best-sellers.html', tag: 'DARK' },
  { path: '/trending', label: 'Trending Now', file: 'trending.html', tag: 'DARK' },
  { path: '/new-arrivals', label: 'New Arrivals', file: 'new-arrivals.html', tag: 'DARK' },
  { path: '/limited', label: 'Limited Edition', file: 'limited.html', tag: 'DARK' },
  { path: '/sale', label: 'Sale & Archive', file: 'sale.html', tag: 'DARK' },
  { path: '/summer', label: 'Summer Collection', file: 'summer.html', tag: 'DARK' },
  { path: '/winter', label: 'Winter Collection', file: 'winter.html', tag: 'DARK' },
  { path: '/festival', label: 'Festival Collection', file: 'festival.html', tag: 'DARK' },
  { path: '/streetwear-core', label: 'Streetwear Core', file: 'streetwear-core.html', tag: 'DARK' },
  { path: '/streetwear-light', label: 'Streetwear Collection', file: 'streetwear-light.html', tag: 'LIGHT' },
  { path: '/anime', label: 'Anime Capsule', file: 'anime.html', tag: 'DARK' },
  { path: '/marvel', label: 'Marvel Collaboration', file: 'marvel.html', tag: 'DARK' },
  { path: '/collab', label: 'Collaboration Hub', file: 'collab.html', tag: 'DARK' },
  { path: '/gym', label: 'Performance Gym Wear', file: 'gym.html', tag: 'DARK' },
  { path: '/dashboard', label: 'Member Dashboard', file: 'dashboard.html', tag: 'LIGHT' },
  { path: '/admin', label: 'Admin Console', file: 'admin.html', tag: 'LIGHT' },
]

const GROUPS = [
  { label: 'HOME', paths: ['/', '/home-light', '/editorial-home'] },
  { label: 'PRODUCT', paths: ['/pdp', '/parka'] },
  { label: 'CHECKOUT', paths: ['/cart', '/cart-premium'] },
  { label: 'COLLECTIONS', paths: ['/women', '/men', '/sneakers', '/footwear', '/accessories', '/oversized', '/premium'] },
  { label: 'DISCOVER', paths: ['/best-sellers', '/trending', '/new-arrivals', '/limited', '/sale', '/summer', '/winter', '/festival'] },
  { label: 'CULTURE', paths: ['/streetwear-core', '/streetwear-light', '/anime', '/marvel', '/collab', '/gym'] },
  { label: 'ACCOUNT', paths: ['/dashboard', '/admin'] },
]

export default function Sidebar({ isOpen, onToggle }) {
  const location = useLocation()
  const [search, setSearch] = useState('')

  const filtered = SCREENS.filter(s =>
    s.label.toLowerCase().includes(search.toLowerCase())
  )

  const currentScreen = SCREENS.find(s => s.path === location.pathname)

  return (
    <>
      {/* Toggle Button */}
      <button
        className={`nav-toggle ${isOpen ? 'sidebar-open' : ''}`}
        onClick={onToggle}
        aria-label="Toggle sidebar"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Sidebar */}
      <nav className={`nav-sidebar ${isOpen ? '' : 'collapsed'}`}>
        <div className="nav-header">
          <div className="nav-logo">
            Atelier<span>.</span>
          </div>
          <div className="nav-badge">STITCH · 30 PGS</div>
        </div>

        <div className="nav-search">
          <input
            type="text"
            placeholder="Search pages..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="nav-links">
          {search ? (
            // Flat filtered results
            filtered.length > 0 ? filtered.map(screen => (
              <NavLink
                key={screen.path}
                to={screen.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <span className="nav-link-dot" />
                {screen.label}
                <span className="nav-link-tag">{screen.tag}</span>
              </NavLink>
            )) : (
              <div style={{ padding: '20px', color: '#444', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>
                NO RESULTS
              </div>
            )
          ) : (
            // Grouped navigation
            GROUPS.map(group => {
              const groupScreens = SCREENS.filter(s => group.paths.includes(s.path))
              return (
                <div key={group.label} className="nav-section">
                  <div className="nav-section-label">{group.label}</div>
                  {groupScreens.map(screen => (
                    <NavLink
                      key={screen.path}
                      to={screen.path}
                      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                      <span className="nav-link-dot" />
                      {screen.label}
                      <span className="nav-link-tag">{screen.tag}</span>
                    </NavLink>
                  ))}
                </div>
              )
            })
          )}
        </div>
      </nav>
    </>
  )
}

export { SCREENS }
