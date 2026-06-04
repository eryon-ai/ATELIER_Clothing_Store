import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import useCartStore from "../../store/useCartStore";
import useWishlistStore from "../../store/useWishlistStore";
import useAuthStore from "../../store/useAuthStore";
import useSearchStore from "../../store/useSearchStore";
import { useAdminStore } from "../../store/useAdminStore";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const cms = useAdminStore((s) => s.storefrontCMS);

  const cartCount = useCartStore((s) => s.getItemCount());
  const wishCount = useWishlistStore((s) => s.getCount());
  const { isAuthenticated } = useAuthStore();
  const {
    openSearch: openSearch,
    openCart: openCart,
  } = {
    openSearch: useSearchStore((s) => s.openSearch),
    openCart: useCartStore((s) => s.openCart),
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const announcement = cms?.announcement;

  return (
    <>
      {/* ── Floating Pill Navbar Container ──────────────────────── */}
      <div
        className={`fixed z-50 w-full transition-all duration-300 px-4 md:px-8 
          ${announcement?.active ? 'top-[40px]' : 'top-3'}`}
      >
        <motion.nav
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`max-w-[1440px] mx-auto flex items-center justify-between gap-4
            bg-white rounded-full px-4 py-3 transition-all duration-300
            ${scrolled 
              ? 'funky-nav-glow border border-[#EAEAEA]' 
              : 'shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-[#F0F0F0]'
            }`}
        >
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 hover:bg-[#F5F5F5] rounded-full transition-colors"
              aria-label="Menu"
            >
              <Menu size={18} className="text-[#111111]" />
            </button>

            <Link to="/" className="flex items-center gap-2">
              {/* Brand icon circle */}
              <div className="w-8 h-8 bg-funky-gradient rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px] font-bold uppercase">A</span>
              </div>
              <span className="hidden md:block font-semibold text-[15px] text-[#111111] tracking-tight">
                ATELIER
              </span>
            </Link>
          </div>

          {/* Center: Category nav links (desktop) */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {(cms?.navigation || []).map((nav) => (
              <div
                key={nav.id}
                className="relative"
                onMouseEnter={() => setActiveMenu(nav.label)}
                onMouseLeave={() => setActiveMenu("")}
              >
                <Link
                  to={nav.url}
                  className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 flex items-center gap-1
                    ${activeMenu === nav.label 
                      ? 'bg-funky-gradient text-white glow-funky' 
                      : 'text-[#666666] hover:text-[#111111] nav-link-funky'
                    }`}
                >
                  {nav.label}
                </Link>
                {/* Dropdown indicator */}
                {(nav.label === "Men" || nav.label === "Women" || nav.label === "Collections") && (
                  <AnimatePresence>
                    {activeMenu === nav.label && (
                      <div
                        className="absolute top-full left-0 pt-3 z-50"
                        onMouseEnter={() => setActiveMenu(nav.label)}
                        onMouseLeave={() => setActiveMenu("")}
                      >
                        <MegaMenu title={nav.label} />
                      </div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </nav>

          {/* Right: Search + Icons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Admin Demo quick access */}
            <Link
              to="/admin"
              className="hidden md:flex items-center gap-1.5 bg-funky-gradient text-white text-[11px] font-semibold px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity whitespace-nowrap glow-funky"
            >
              Admin
            </Link>

            <button
              onClick={openSearch}
              className="p-2 hover:bg-[#F5F5F5] rounded-full transition-colors"
              aria-label="Search"
            >
              <Search size={18} className="text-[#111111]" />
            </button>

            <Link
              to="/wishlist"
              className="relative p-2 hover:bg-[#F5F5F5] rounded-full transition-colors"
              aria-label="Wishlist"
            >
              <Heart size={18} className="text-[#111111]" />
              {wishCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff007f] text-[9px] font-bold text-white glow-funky">
                  {wishCount > 9 ? "9+" : wishCount}
                </span>
              )}
            </Link>

            <button
              onClick={openCart}
              className="relative p-2 hover:bg-[#F5F5F5] rounded-full transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag size={18} className="text-[#111111]" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#00f2fe] text-[9px] font-bold text-white glow-funky">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            <Link
              to={isAuthenticated ? "/dashboard" : "/auth/login"}
              className="p-2 hover:bg-[#F5F5F5] rounded-full transition-colors hidden md:flex"
              aria-label="Account"
            >
              <User size={18} className="text-[#111111]" />
            </Link>
          </div>
        </motion.nav>
      </div>

      {/* Mobile Drawer */}
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        cartCount={cartCount}
        wishCount={wishCount}
        openSearch={openSearch}
        openCart={openCart}
        isAuthenticated={isAuthenticated}
        navigation={cms?.navigation || []}
      />
    </>
  );
}

function MegaMenu({ title }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.98 }}
      transition={{ duration: 0.18 }}
      className="bg-white border border-[#EAEAEA] rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.10)] p-8 min-w-[640px]"
    >
      <div className="grid grid-cols-3 gap-8">
        {/* Featured Image */}
        <div className="col-span-2 relative overflow-hidden rounded-2xl group h-[280px]">
          <Link to="/products" className="block w-full h-full">
            <img
              src="/images/knitwear.png"
              alt="Featured Collection"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors rounded-2xl" />
            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-xs font-semibold tracking-widest uppercase mb-1">New Collection</p>
              <h3 className="text-2xl font-semibold">Spring/Summer 2026</h3>
            </div>
          </Link>
        </div>

        {/* Links */}
        <div className="flex flex-col pt-1">
          <h3 className="mb-5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#111111]">
            {title}
          </h3>
          <div className="space-y-3">
            {["Jackets", "Shirts", "Knitwear", "Outerwear", "Denim", "Trousers", "Accessories"].map((item) => (
              <Link
                key={item}
                to={`/collections/${item.toLowerCase()}`}
                className="block text-[13px] text-[#666666] hover:text-[#111111] transition-colors font-medium"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MobileMenu({ open, onClose, cartCount, wishCount, openSearch, openCart, isAuthenticated, navigation }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.28 }}
          className="fixed inset-0 z-[60] bg-white overflow-y-auto"
          style={{ borderRadius: "0" }}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <Link to="/" onClick={onClose} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#111111] rounded-full flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold uppercase">A</span>
                </div>
                <span className="font-semibold text-[15px] text-[#111111]">ATELIER</span>
              </Link>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#F5F5F5] rounded-full transition-colors"
              >
                <X size={20} className="text-[#111111]" />
              </button>
            </div>

            {/* Quick action icons */}
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#EAEAEA]">
              <button
                onClick={() => { onClose(); openSearch(); }}
                className="flex-1 flex flex-col items-center gap-1.5 py-3 bg-[#F5F5F5] rounded-2xl"
              >
                <Search size={20} className="text-[#111111]" />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-[#666666]">Search</span>
              </button>
              <Link to="/wishlist" onClick={onClose} className="flex-1 flex flex-col items-center gap-1.5 py-3 bg-[#F5F5F5] rounded-2xl relative">
                <Heart size={20} className="text-[#111111]" />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-[#666666]">Wishlist</span>
                {wishCount > 0 && (
                  <span className="absolute top-2 right-6 bg-[#111111] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {wishCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => { onClose(); openCart(); }}
                className="flex-1 flex flex-col items-center gap-1.5 py-3 bg-[#F5F5F5] rounded-2xl relative"
              >
                <ShoppingBag size={20} className="text-[#111111]" />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-[#666666]">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute top-2 right-6 bg-[#111111] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
              <Link to={isAuthenticated ? "/dashboard" : "/auth/login"} onClick={onClose} className="flex-1 flex flex-col items-center gap-1.5 py-3 bg-[#F5F5F5] rounded-2xl">
                <User size={20} className="text-[#111111]" />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-[#666666]">Account</span>
              </Link>
            </div>

            {/* Nav Links */}
            <div className="space-y-1">
              {navigation.map((nav) => (
                <Link
                  key={nav.id}
                  to={nav.url}
                  onClick={onClose}
                  className="flex items-center justify-between py-4 px-4 hover:bg-[#F5F5F5] rounded-2xl transition-colors group"
                >
                  <span className="text-[16px] font-medium text-[#111111]">{nav.label}</span>
                  <ChevronDown size={16} className="text-[#999999] -rotate-90 group-hover:text-[#111111] transition-colors" />
                </Link>
              ))}
            </div>

            {/* Admin link */}
            <div className="mt-8 pt-6 border-t border-[#EAEAEA]">
              <Link
                to="/admin"
                onClick={onClose}
                className="flex items-center justify-center gap-2 bg-[#111111] text-white py-3.5 rounded-full text-[12px] font-semibold"
              >
                Admin Panel Demo
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
