import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import AnnouncementBar from '../components/layout/AnnouncementBar'
import CartDrawer from '../components/cart/CartDrawer'
import SearchOverlay from '../components/search/SearchOverlay'
import MobileNav from '../components/layout/MobileNav'

export default function MainLayout() {
  const { pathname } = useLocation()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1 relative">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
      <CartDrawer />
      <SearchOverlay />
    </div>
  )
}
