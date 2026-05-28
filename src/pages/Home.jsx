import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/product/ProductCard'
import { getNewArrivals, getBestSellers, getFeaturedProducts, PRODUCTS } from '../mock/products'
import { formatPrice } from '../utils'

// ── Countdown Timer Hook ─────────────────────────────────────────
function useCountdown() {
  const [time, setTime] = useState({ h: '00', m: '00', s: '00' })
  useEffect(() => {
    const update = () => {
      const now = Date.now()
      const distance = (24 * 60 * 60 * 1000) - (now % (24 * 60 * 60 * 1000))
      const h = Math.floor(distance / 3600000)
      const m = Math.floor((distance % 3600000) / 60000)
      const s = Math.floor((distance % 60000) / 1000)
      setTime({
        h: String(h).padStart(2, '0'),
        m: String(m).padStart(2, '0'),
        s: String(s).padStart(2, '0'),
      })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

export default function HomePage() {
  const newArrivals = getNewArrivals()
  const bestSellers = getBestSellers().slice(0, 4)
  const { h, m, s } = useCountdown()

  const HERO_IMG = '/hero-bg.jpg'
  const ANIME_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3fO9Ux_986oCEyZy22QxW-XhwTO8Sdtvl2W6MxvHyE9gpT5pTuFh5v4abW_cJVdovbivGe8akkRulA5V53cCK-vQ4puvA9hSathvDuNbhucQ4YJxsElmwlYO_dLW-lGZR3xTiI-wx28qATQtPJj_rDyZn-gs1TBpIiA9TWEF5qYLPt8ObowPlsHTcEjJm_IGxsV4oa2tMsVetupjGJVuSlp_7EJlUZEf-eG_au8an9BaJspM0vxDWDgkdvnJ8LpUXK6fy_S2OL7jH'
  const OVERSIZED_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_fhHn5Hn6tgNMh6DUp3HD55j8xPWI68xAF_1gh_oftsn0GE4uj0wTMH9VK3kOQy3BkJ2m1l0n_I9OWa2XjOlmZvVa7sCTjhKOTSexkaCg5DFzSgoHHuIbdTo3pLUhrBaFwF-LxFKqx5atZvUt7f5eoWBgRJVi5tnKxuOelUSpZhMHkyNMZ2AL8mksUBM6hPp63nxCNi8o2N0A_cNpK0TGJi8FaeUpNG9NRGaj4NWeMBmHisKeU1zcCmRHib6JredR3xZjKbvmX5BX'

  const CATEGORIES = [
    { label: 'Women', href: '/collections/women', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYvrcuJ2GC_4gmd9C1KTu-4bdvku04Ssg5d3C8vUsWSUarrjJp2fhodyjg4WOk5AWrEInM1qD8jGEGkVkb3ecPGMkJkiLImDokbTb4NBNxEa_3RIXir6WiGBHKzMPCLrzyY95IOfc_p9rwj70oNAkFk1qfnqOSKqgkdb4GoHxP2itmob85ks3jcC-JKSEpzl1R9ZrO86uUm9A6GxGo5iY8yeuBZBczVBa-DYfavHXC355raT9X04SXUp_5lo0hziKvVZf4pgDSF7s3' },
    { label: 'Men', href: '/collections/men', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_586sb_c52RTYCAtHqN4-ypY-gcescE8s7gvT9uh1NdOKuLuqocaCvh05fnfGryInom16TkoLBwabPxXV1Su2hQeDsydTTWEDUp1Xc9Cv8q09ESR4oNX656O8hKNIpa6Wnd9zqmozzGxafl3rMeWbIFS5vUM_41-EKKtfc3nx8JJIPj-mrv26Rii1bEFo7SdiJ3aKtCrZag8_-xm2KhW7naawyhN3-eaY5Z4YB2iGBvUihzKGgTVaCd8UHPER6ElOtVAgWz2Qv9PM' },
    { label: 'Accessories', href: '/collections/accessories', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8Jqpmy24W7jfNIiYQy8F1gmQVZkpLVPPolObuEKz3OIMu2Xnuhcj8wlEOXLVWkofMqRDg44_SiITgKFPuaR22XNfh1CDNbGhCgPOYPuSp1FC34yiOcECKf6LCwZWG8j7mdUdkefZhHybgKY7A0OmpcQBaiPNZ9YUk07d1_vgY_tfvI0Afx8nUnnduucLiAWgu51O6K-MHMOaTah8AjV5g0iMzPLlRRPgyt8q_VmX1YwmkxDBOkWzWbdRrno1JwRY8X6bb3upAZRjv' },
    { label: 'Footwear', href: '/collections/footwear', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDmfXZb4f_2AxcG-4UgT0RyBP8AO-CCG_1ELev7Yy0b8iiYHSLUDdGb7_IBtpDX8cJgULIMPDCu_vP3HGAMCM-1Wa0yNIZKslaoNz4XaokJb9DDJSf-nQx-ctmDbxeS7lybCpH37F3ABkn5lWkliqA0EEBUdgHKZt_d5_FkCYubFXdQ_h2aXqU_vphpMLkFKbrxeMijvwS5eYKUMznj2tA6SK9R2d2osvY2kCv7zsv8PwF8lDQxkK00qtxEmvBUrPv8Y482bIhQBL0' },
  ]

  return (
    <>
      {/* ── Hero Section ─────────────────────────────────────────── */}
      <section className="relative h-[100svh] min-h-[600px] overflow-hidden">
        <div className="absolute inset-0 hero-zoom">
          <img src={HERO_IMG} alt="ATELIER Campaign" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end px-margin-desktop pb-xl max-w-8xl mx-auto">
          <span className="font-label-md text-label-md text-white/80 uppercase tracking-[0.3em] mb-4">
            Summer Collection 2024
          </span>
          <h1 className="font-display text-[clamp(36px,6vw,72px)] font-bold leading-none text-white mb-6 max-w-3xl tracking-tight uppercase">
            THE ARCHITECTURAL SILHOUETTE.
          </h1>
          <div className="flex gap-md flex-wrap">
            <Link to="/collections/men" className="bg-white text-primary px-lg py-md font-label-md text-label-md uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
              Shop Men
            </Link>
            <Link to="/collections/women" className="border border-white text-white px-lg py-md font-label-md text-label-md uppercase tracking-widest hover:bg-white hover:text-primary transition-all">
              Shop Women
            </Link>
          </div>
        </div>
      </section>

      {/* ── Category Grid ────────────────────────────────────────── */}
      <section className="py-xl px-margin-desktop max-w-8xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          {CATEGORIES.map(cat => (
            <Link key={cat.label} to={cat.href} className="group relative aspect-[3/4] overflow-hidden">
              <img
                src={cat.img}
                alt={cat.label}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-end p-md bg-gradient-to-t from-black/40 to-transparent">
                <span className="font-label-md text-label-md text-white uppercase tracking-widest">{cat.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Flash Sale Banner ────────────────────────────────────── */}
      <section className="bg-surface-container-low py-lg border-y border-outline-variant">
        <div className="px-margin-desktop max-w-8xl mx-auto flex flex-col md:flex-row justify-between items-center gap-md">
          <div className="text-center md:text-left">
            <h2 className="font-headline-lg text-headline-lg text-primary">LIMITED ARCHIVE SALE</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Up to 40% off selected seasonal staples. Ends soon.</p>
          </div>
          <div className="flex gap-lg text-center">
            {[{ v: h, l: 'Hours' }, { v: m, l: 'Mins' }, { v: s, l: 'Secs' }].map(({ v, l }) => (
              <div key={l}>
                <span className="font-display text-display-lg text-primary block">{v}</span>
                <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">{l}</span>
              </div>
            ))}
          </div>
          <Link to="/collections/sale" className="bg-primary text-on-primary px-lg py-md font-label-md text-label-md uppercase tracking-widest hover:bg-secondary transition-colors">
            Access Sale
          </Link>
        </div>
      </section>

      {/* ── Bento Grid ──────────────────────────────────────────── */}
      <section className="py-xl px-margin-desktop max-w-8xl mx-auto">
        {/* Fixed height grid — each cell is explicitly contained so nothing bleeds */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter h-auto md:h-[580px]">
          {/* Anime — left large cell */}
          <Link
            to="/collections/anime"
            className="md:col-span-7 relative group overflow-hidden block min-h-[320px] md:min-h-0"
          >
            <img
              src={ANIME_IMG}
              alt="Anime Archive"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
            <div className="absolute inset-0 flex flex-col justify-end p-lg">
              <h3 className="font-headline-lg text-headline-lg text-white mb-2">ANIME ARCHIVE</h3>
              <p className="font-body-md text-body-md text-white/80 mb-6 max-w-md hidden md:block">
                Subculture meets high-craftsmanship. Technical apparel inspired by neo-noir animation.
              </p>
              <span className="text-white font-label-md text-label-md uppercase tracking-widest border-b border-white w-fit pb-1">
                Explore Series
              </span>
            </div>
          </Link>

          {/* Right column — two stacked cells */}
          <div className="md:col-span-5 grid grid-rows-2 gap-gutter">
            {/* Oversized — top right */}
            <Link
              to="/collections/oversized"
              className="relative group overflow-hidden block min-h-[200px] md:min-h-0"
            >
              <img
                src={OVERSIZED_IMG}
                alt="Oversized Essentials"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition-colors" />
              <div className="absolute inset-0 flex flex-col justify-end p-lg">
                <h3 className="font-headline-md text-headline-md text-white">OVERSIZED ESSENTIALS</h3>
                <span className="text-white font-label-md text-label-md uppercase tracking-widest border-b border-white w-fit pb-1 mt-2">
                  Shop Now
                </span>
              </div>
            </Link>

            {/* AI Curation CTA — bottom right */}
            <div className="bg-surface-container-highest p-lg flex flex-col justify-center items-center text-center min-h-[180px] md:min-h-0">
              <span className="material-symbols-outlined icon-xl text-secondary mb-4">smart_toy</span>
              <h3 className="font-headline-md text-headline-md text-primary mb-2">AI-DRIVEN CURATION</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4 text-sm hidden md:block">
                Experience a personalized storefront powered by your aesthetic profile.
              </p>
              <Link
                to="/auth/signup"
                className="bg-primary text-on-primary px-md py-sm font-label-md text-label-md uppercase tracking-widest hover:bg-secondary transition-colors text-xs"
              >
                Connect Style ID
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── New Arrivals Carousel ────────────────────────────────── */}
      <section className="pt-xl pb-lg bg-surface-container-lowest border-t border-b border-outline-variant/30">
        {/* Header — constrained so View All never floats over cards */}
        <div className="px-margin-desktop max-w-8xl mx-auto mb-lg flex justify-between items-end">
          <div>
            <span className="section-label">Just Landed</span>
            <h2 className="font-headline-lg text-headline-lg text-primary">NEW ARRIVALS</h2>
          </div>
          <Link
            to="/collections/new-arrivals"
            className="flex-shrink-0 ml-md font-label-md text-label-md uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors border-b border-outline-variant hover:border-primary pb-1"
          >
            View All
          </Link>
        </div>
        {/* Carousel row — overflow-x scroll only on this div */}
        <div
          className="flex gap-gutter px-margin-desktop overflow-x-auto hide-scrollbar snap-x snap-mandatory"
          style={{ paddingBottom: '8px' }}
        >
          {(newArrivals.length > 0 ? newArrivals : PRODUCTS.slice(0, 6)).map(p => (
            <div key={p.id} className="flex-shrink-0 w-[260px] md:w-[300px] snap-start">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>


      {/* ── Best Sellers ────────────────────────────────────────── */}
      <section className="py-xl px-margin-desktop max-w-8xl mx-auto border-t border-outline-variant/40">
        <div className="mb-lg flex justify-between items-end">
          <div>
            <span className="section-label">Most Loved</span>
            <h2 className="font-headline-lg text-headline-lg text-primary">BEST SELLERS</h2>
          </div>
          <Link to="/collections/best-sellers" className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors border-b border-outline-variant hover:border-primary pb-1">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          {bestSellers.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* ── Community / UGC Section ──────────────────────────────── */}
      <section className="py-xl px-margin-desktop max-w-8xl mx-auto">
        <div className="text-center mb-xl">
          <h2 className="font-headline-lg text-headline-lg text-primary">COMMUNITY VOICES</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Styled by you, curated by us. Tag #AtelierArchive to be featured.</p>
        </div>
        <div className="columns-2 md:columns-4 gap-gutter space-y-gutter">
          {[
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBc42Ul7eBcYG57bjJrfOTETb9I15LxX0g5ttWCRsHwNBt1yPdTLsqbco1n7F1p7ZUEw5RuibHO6Cn8Cel426n99iUI1V7fVjyLjIGBDfhOASTZtDk2eTqphFWLJ-0Xf_6d-7pHWlvzBiRXxUbTGqLZ_vBJU8D9jRwmBYu24C1Pa-aMDdksw_Dfq8wBXmQGiGG-22yzDkglbRaZaToKklaUX59NsQJkpr5i4GvhrB8KMkeBjiP-2YVEUPamok5nPIDuh2Z2TwS74ycp',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuDLy8x3zngkLZ972puwGCPclANr-euC5Bb-nMv4FTNIOGPf8Ha1DngEWxwfxtRO7SeTqSaxiTClJIt1y_jDAJT97baX4p2Q92DzvZQRZiqtGy6oeMPX7HEW7P2X9iBS6I1zyUEIsqtEXluqhKbEeO0rItcs0GOv-Wt9QgAqU6v1anBWBl6LcelCGkkUUCUsxPU4aYOX0sNgBRVgy3HcW2--j9gNbabAPL-Ya6OKNXHvqXZO6ntM0ASybSPJ0b_10bv09ChFewvRwP3HT',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuDAtVrwP577exKOJA-hgyqpavtwEciPSyvc3FSz2GIPCh1Euw7xmoJgt-MhwULFxx4CWpqwAKh38f8q2KQg2dKOu2Y4dru9A40vLeIzw27jFHQRRDbmmBNENxxnWp2eV0Nb4yzYq1S_dH-w7QlX4Vm_1QbJhl6wY6psGg2xliwAfB93p-By2mHtGLK_gmX7dz7TSEIn49Esmn7u__gHrj46bNe2gsrfrv3WgO7x3mZF5ungOxgWJgn21W5JE3QOUcRxgeo7dg9XmKW9',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuC9lFLCFwhVxv8xPXUhy_RbCKR-leJoBwh4yPV4CLEwC5BOX_ew_cXYQ5kXL9tVppUfKsexGBboVwbPM35DBaMdqXWNHEUaI0iZAd0SSN_L-qK5SiNI2Coyn39N8krF-sB5sIX56_1rDuEpEZByq2I9I81ZgTj0rhmfsj1hlNRVjtPsI0Y2qLomSbkNvXLj9c_1rJoH0nRK0du9Hz-2bwQfwQaldcJaNLMa_hEd3KoOQ5dznPke-bG5sBMRONByA8mrYnjg6-6s994',
          ].map((img, i) => (
            <div key={i} className="relative group break-inside-avoid">
              <img src={img} alt={`Community look ${i + 1}`} className="w-full h-auto" loading="lazy" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-label-sm text-label-sm uppercase tracking-widest">Shop the look</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
