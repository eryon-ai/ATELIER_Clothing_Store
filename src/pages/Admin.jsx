import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminStore } from '../store/useAdminStore'
import { ADMIN_SIDEBAR_ITEMS } from '../constants'



export default function AdminPage() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768)
  const { products, orders } = useAdminStore()
  
  const location = useLocation()
  const activeSection = location.pathname.split('/').pop() || 'overview'
  const active = ADMIN_SIDEBAR_ITEMS.find(s => s.id === activeSection) || ADMIN_SIDEBAR_ITEMS[0]

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 80 }}
        className="bg-white m-4 rounded-3xl shadow-sm flex flex-col h-[calc(100vh-2rem)] overflow-hidden flex-shrink-0 z-20"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-outline-variant/10">
          <div className="w-8 h-8 bg-primary text-on-primary flex items-center justify-center font-bold text-sm flex-shrink-0">A</div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-bold uppercase tracking-widest text-sm text-primary whitespace-nowrap"
              >
                Admin
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="ml-auto material-symbols-outlined text-outline hover:text-primary transition-colors text-lg flex-shrink-0"
          >
            {sidebarOpen ? 'chevron_left' : 'chevron_right'}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 flex flex-col gap-1.5 overflow-y-auto hide-scrollbar">
          {ADMIN_SIDEBAR_ITEMS.map(item => (
            <Link
              key={item.id}
              to={`/admin/${item.id}`}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all group relative ${
                activeSection === item.id
                  ? 'admin-nav-active shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-variant/30 hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-xl flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">{item.icon}</span>
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-semibold uppercase tracking-widest whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-outline-variant/10 p-4">
          <Link 
            to="/" 
            className={`flex items-center justify-center gap-2 bg-[#111111] text-white px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#333333] transition-colors w-full ${sidebarOpen ? '' : 'px-0'}`}
          >
            <span className="material-symbols-outlined text-lg flex-shrink-0">arrow_back</span>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                  Storefront
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm mx-4 mt-4 mb-2 rounded-full px-6 py-4 flex items-center justify-between sticky top-0 z-10 border border-white/40">
          <div>
            <h1 className="font-bold uppercase tracking-widest text-primary">{active?.label}</h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {activeSection === 'products' && `${products.length} total products`}
              {activeSection === 'orders' && `${orders.length} total orders`}
              {activeSection === 'overview' && 'Welcome back, Admin'}
              {activeSection === 'analytics' && 'Performance insights'}
              {activeSection === 'customers' && 'Customer management'}
              {activeSection === 'settings' && 'Store configuration'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">notifications</button>
            <div className="w-8 h-8 bg-primary text-on-primary rounded-full flex items-center justify-center font-bold text-sm">A</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 pb-4 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
