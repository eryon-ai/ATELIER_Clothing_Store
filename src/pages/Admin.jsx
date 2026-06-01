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
    <div className="min-h-screen bg-surface-container-lowest flex">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 68 }}
        className="bg-white border-r border-outline-variant/30 flex flex-col sticky top-0 h-screen overflow-hidden flex-shrink-0"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-outline-variant/20">
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
        <nav className="flex-1 py-4 flex flex-col gap-1">
          {ADMIN_SIDEBAR_ITEMS.map(item => (
            <Link
              key={item.id}
              to={`/admin/${item.id}`}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all group relative ${
                activeSection === item.id
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-lowest hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-xl flex-shrink-0">{item.icon}</span>
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
              {activeSection === item.id && (
                <motion.div layoutId="activeBar" className="absolute left-0 w-0.5 h-8 bg-white" />
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-outline-variant/20 px-4 py-4">
          <Link 
            to="/" 
            className={`flex items-center justify-center gap-2 bg-black text-white px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#D4B996] transition-colors w-full ${sidebarOpen ? '' : 'px-0'}`}
          >
            <span className="material-symbols-outlined text-xl flex-shrink-0">arrow_back</span>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                  Main Website
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-outline-variant/30 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
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
        <main className="flex-1 p-4 md:p-6 overflow-auto">
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
