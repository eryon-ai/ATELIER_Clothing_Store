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

const navItems = [
  "New Arrivals",
  "Men",
  "Women",
  "Collections",
  "Luxury Essentials",
  "Accessories",
  "Sale",
];

const getNavHref = (item) => {
  switch (item) {
    case "New Arrivals": return "/collections/new-arrivals";
    case "Men": return "/collections/men";
    case "Women": return "/collections/women";
    case "Collections": return "/products";
    case "Luxury Essentials": return "/collections/premium";
    case "Accessories": return "/collections/accessories";
    case "Sale": return "/collections/sale";
    default: return "/products";
  }
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Existing store bindings
  const cartCount = useCartStore((s) => s.getItemCount());
  const wishCount = useWishlistStore((s) => s.getCount());
  const { isAuthenticated } = useAuthStore();
  const { openSearch, openCart } = {
    openSearch: useSearchStore((s) => s.openSearch),
    openCart: useCartStore((s) => s.openCart),
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        className={`fixed top-0 z-50 w-full border-b border-[#EAEAEA] transition-colors duration-300
          ${
            scrolled
              ? "bg-background/90 backdrop-blur-xl shadow-sm"
              : "bg-background/60 backdrop-blur-md"
          }
        `}
      >
        {/* MegaMenu anchored to bottom of header */}
        <AnimatePresence>
          {(activeMenu === "Men" || activeMenu === "Women" || activeMenu === "Collections") && (
            <div
              className="absolute top-full left-0 w-full z-50 flex justify-center"
              onMouseEnter={() => setActiveMenu(activeMenu)}
              onMouseLeave={() => setActiveMenu("")}
            >
              <MegaMenu title={activeMenu} />
            </div>
          )}
        </AnimatePresence>
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-4 md:px-8">
          {/* Logo */}
          <Link to="/" className="cursor-pointer">
            <h1 className="font-serif text-3xl tracking-[0.25em]">ATELIER</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => (
              <div
                key={item}
                className="relative"
                onMouseEnter={() => setActiveMenu(item)}
                onMouseLeave={() => setActiveMenu("")}
              >
                <Link
                  to={getNavHref(item)}
                  className="group relative text-sm tracking-wider text-[#1A1A1A]"
                >
                  {item}

                  <span
                    className="
                      absolute
                      left-1/2
                      bottom-[-8px]
                      h-[1px]
                      w-0
                      bg-black
                      transition-all
                      duration-300
                      group-hover:left-0
                      group-hover:w-full
                    "
                  />
                </Link>
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-6">
            <Link 
              to="/admin" 
              className="bg-black text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-[#D4B996] transition-colors whitespace-nowrap"
            >
              Admin Demo
            </Link>
            <button onClick={openSearch} aria-label="Search">
              <Search className="h-5 w-5 cursor-pointer hover:opacity-70 transition-opacity" />
            </button>

            <Link to="/wishlist" aria-label="Wishlist" className="relative">
              <motion.div whileHover={{ scale: 1.1 }}>
                <Heart className="h-5 w-5 cursor-pointer hover:opacity-70 transition-opacity" />
              </motion.div>
              {wishCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#D4B996] text-[10px] text-white">
                  {wishCount}
                </span>
              )}
            </Link>

            <button onClick={openCart} className="relative" aria-label="Cart">
              <motion.div whileHover={{ scale: 1.1 }}>
                <ShoppingBag className="h-5 w-5 cursor-pointer hover:opacity-70 transition-opacity" />
              </motion.div>

              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#D4B996] text-[10px] text-white">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            <Link
              to={isAuthenticated ? "/dashboard" : "/auth/login"}
              aria-label="User"
            >
              <User className="h-5 w-5 cursor-pointer hover:opacity-70 transition-opacity" />
            </Link>
          </div>

          {/* Mobile Button */}
          <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu />
          </button>
        </div>
      </motion.header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        cartCount={cartCount}
        wishCount={wishCount}
        openSearch={openSearch}
        openCart={openCart}
        isAuthenticated={isAuthenticated}
      />
    </>
  );
}

function MegaMenu({ title }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="
        w-[90vw]
        max-w-[1000px]
        rounded-b-2xl
        border
        border-[#EAEAEA]
        border-t-0
        bg-background
        p-10
        shadow-2xl
      "
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Featured Image */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-lg group h-[340px]">
          <Link to="/products" className="block w-full h-full">
            <img 
              src="/images/knitwear.png"
              alt="Featured Collection" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="absolute bottom-8 left-8 text-white">
              <p className="text-xs font-semibold tracking-widest uppercase mb-2 drop-shadow-md">New Collection</p>
              <h3 className="text-3xl font-serif drop-shadow-lg">Spring/Summer 2026</h3>
            </div>
          </Link>
        </div>

        {/* Links Column */}
        <div className="flex flex-col pt-2">
          <h3 className="mb-6 text-sm font-semibold uppercase tracking-[0.2em] text-[#1A1A1A]">
            {title}
          </h3>
          <div className="space-y-4">
            {["Jackets", "Shirts", "Knitwear", "Outerwear", "Denim", "Trousers", "Accessories"].map(
              (item) => (
                <Link
                  key={item}
                  to={`/collections/${item.toLowerCase()}`}
                  className="block text-sm text-gray-500 hover:text-black transition-colors"
                >
                  {item}
                </Link>
              )
            )}
          </div>
        </div>

        {/* Highlight Cards */}
        <div className="flex flex-col justify-between space-y-6">
          {[
            { label: "The Essentials", img: "/images/tops.png" },
            { label: "Luxury Edit", img: "/images/outerwear.png" }
          ].map((card) => (
            <Link key={card.label} to="/products" className="block group flex-1 relative overflow-hidden rounded-lg bg-neutral-100">
              <div className="h-[155px] w-full">
                <img src={card.img} alt={card.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-5">
                <h4 className="text-white text-sm font-medium tracking-widest uppercase drop-shadow-md">{card.label}</h4>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function MobileMenu({
  open,
  onClose,
  cartCount,
  wishCount,
  openSearch,
  openCart,
  isAuthenticated,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.3 }}
          className="
            fixed
            inset-0
            z-[60]
            bg-background
            p-8
            overflow-y-auto
          "
        >
          <div className="mb-8 flex items-center justify-between">
            <Link to="/" onClick={onClose} className="cursor-pointer">
              <h1 className="font-serif text-2xl tracking-[0.25em]">ATELIER</h1>
            </Link>
            <button onClick={onClose} className="p-2">
              <X />
            </button>
          </div>

          <div className="flex gap-6 mb-8 justify-center border-b pb-8">
            <button
              onClick={() => {
                onClose();
                openSearch();
              }}
              className="flex flex-col items-center gap-2"
            >
              <Search className="h-6 w-6" />
              <span className="text-xs uppercase tracking-widest">Search</span>
            </button>
            <Link
              to="/wishlist"
              onClick={onClose}
              className="flex flex-col items-center gap-2 relative"
            >
              <Heart className="h-6 w-6" />
              <span className="text-xs uppercase tracking-widest">Wishlist</span>
              {wishCount > 0 && (
                <span className="absolute -top-1 right-2 bg-[#D4B996] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {wishCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => {
                onClose();
                openCart();
              }}
              className="flex flex-col items-center gap-2 relative"
            >
              <ShoppingBag className="h-6 w-6" />
              <span className="text-xs uppercase tracking-widest">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 right-1 bg-[#D4B996] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <Link
              to={isAuthenticated ? "/dashboard" : "/auth/login"}
              onClick={onClose}
              className="flex flex-col items-center gap-2"
            >
              <User className="h-6 w-6" />
              <span className="text-xs uppercase tracking-widest">Account</span>
            </Link>
          </div>

          <div className="space-y-6">
            {navItems.map((item) => (
              <Link
                key={item}
                to={getNavHref(item)}
                onClick={onClose}
                className="
                  flex
                  w-full
                  items-center
                  justify-between
                  border-b
                  border-gray-100
                  pb-4
                  text-xl
                "
              >
                {item}
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
