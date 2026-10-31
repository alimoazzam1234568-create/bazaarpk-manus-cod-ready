import { Link, useLocation } from "wouter";
import { Heart, Search, ShoppingBag, UserRound, X, Minus, Plus, Trash2, Menu, ArrowRight, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { categories, formatPKR, getDiscount, getProduct, type Product, useStore } from "@/lib/store";

export function Mark() {
  return <Link href="/" className="brand-mark" aria-label="BazaarPK home"><span className="brand-mark-symbol">B</span><span><strong>Bazaar</strong><em>PK</em></span></Link>;
}

export function Header() {
  const { itemCount, cartOpen, setCartOpen, language, setLanguage } = useStore();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [, navigate] = useLocation();
  const submitSearch = (event: React.FormEvent) => { event.preventDefault(); navigate(`/shop${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`); setMenuOpen(false); };
  return <>
    <div className="announcement"><span>Free delivery on orders above <b>Rs. 3,000</b></span><span className="announcement-detail">Cash on delivery · Nationwide</span></div>
    <header className="site-header">
      <div className="header-main container">
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open navigation"><Menu size={21} /></button>
        <Mark />
        <nav className={`main-nav ${menuOpen ? "is-open" : ""}`}>
          <Link href="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link href="/shop?category=traditional" onClick={() => setMenuOpen(false)}>Traditional</Link>
          <Link href="/shop?category=beauty" onClick={() => setMenuOpen(false)}>Beauty</Link>
          <Link href="/shop?sale=true" onClick={() => setMenuOpen(false)} className="sale-link">The edit <span>New</span></Link>
        </nav>
        <form className="header-search" onSubmit={submitSearch}><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the edit..." aria-label="Search products" /><kbd>⌘ K</kbd></form>
        <div className="header-actions">
          <button className="icon-btn account-btn" onClick={() => user ? navigate("/account") : startLogin()} aria-label="Account"><UserRound size={19} /><span className="hide-mobile">{user ? "Account" : "Sign in"}</span></button>
          <button className="icon-btn bag-btn" onClick={() => setCartOpen(!cartOpen)} aria-label="Open cart"><ShoppingBag size={20} /><span className="bag-count">{itemCount}</span></button>
          <button className="language-btn" onClick={() => setLanguage(language === "en" ? "ur" : "en")} aria-label="Toggle language">{language === "en" ? "اردو" : "EN"}</button>
        </div>
      </div>
      <div className="header-cats"><div className="container category-nav"><Link href="/shop">All pieces</Link>{categories.slice(0, 6).map((category) => <Link key={category.key} href={`/shop?category=${category.key}`}>{category.label}</Link>)}<span className="demo-chip">Demo catalog</span></div></div>
    </header>
    <CartDrawer />
  </>;
}

export function CartDrawer() {
  const { cartOpen, setCartOpen, cart, updateQuantity, removeFromCart, subtotal, delivery, discount, total, coupon, couponError, applyCoupon } = useStore();
  const [couponInput, setCouponInput] = useState(coupon);
  if (!cartOpen) return null;
  return <div className="drawer-layer" onMouseDown={(e) => { if (e.target === e.currentTarget) setCartOpen(false); }}><aside className="cart-drawer" aria-label="Shopping bag">
    <div className="drawer-head"><div><span className="eyebrow">Your selection</span><h2>Shopping bag <small>({cart.length})</small></h2></div><button className="close-btn" onClick={() => setCartOpen(false)}><X size={20} /></button></div>
    {cart.length === 0 ? <div className="empty-state"><div className="empty-icon"><ShoppingBag size={26} /></div><h3>Your bag is waiting</h3><p>Save a few things for later. Your everyday edit starts here.</p><Link href="/shop" className="button button-dark" onClick={() => setCartOpen(false)}>Explore the edit <ArrowRight size={15} /></Link></div> : <>
      <div className="cart-items">{cart.map((item) => { const product = getProduct(item.productId); if (!product) return null; return <div className="cart-item" key={item.lineId}><img src={product.image} alt={product.name} /><div className="cart-item-info"><Link href={`/product/${product.id}`} onClick={() => setCartOpen(false)}>{product.name}</Link><span>{item.size || product.sizes[0]} · {item.color || product.colors[0]}</span><strong>{formatPKR(product.price)}</strong><div className="quantity-control"><button onClick={() => updateQuantity(item.lineId, item.quantity - 1)}><Minus size={13} /></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.lineId, item.quantity + 1)}><Plus size={13} /></button><button className="remove-item" onClick={() => removeFromCart(item.lineId)}><Trash2 size={14} /></button></div></div></div>; })}</div>
      <div className="drawer-bottom"><div className="coupon-line"><input value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="Coupon code" /><button onClick={() => applyCoupon(couponInput)}>Apply</button></div>{couponError && <small className="form-error">{couponError}</small>}<div className="summary-line"><span>Subtotal</span><strong>{formatPKR(subtotal)}</strong></div><div className="summary-line"><span>Delivery</span><strong>{delivery === 0 ? "Free" : formatPKR(delivery)}</strong></div>{discount > 0 && <div className="summary-line discount-line"><span>Discount</span><strong>− {formatPKR(discount)}</strong></div>}<div className="summary-total"><span>Total</span><strong>{formatPKR(total)}</strong></div><Link href="/checkout" className="button button-dark button-full" onClick={() => setCartOpen(false)}>Continue to checkout <ArrowRight size={16} /></Link><p className="drawer-note">Secure checkout · Demo catalog · COD available</p></div>
    </>}
  </aside></div>;
}

export function SectionHeading({ kicker, title, text, action = "View all" }: { kicker?: string; title: string; text?: string; action?: string }) {
  return <div className="section-heading"><div><span className="eyebrow">{kicker}</span><h2>{title}</h2>{text && <p>{text}</p>}</div>{action && <Link href="/shop" className="text-link">{action} <ArrowRight size={15} /></Link>}</div>;
}

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const saved = wishlist.includes(product.id);
  return <article className={`product-card ${compact ? "product-card-compact" : ""}`}>
    <div className="product-media"><Link href={`/product/${product.id}`}><img src={product.image} alt={product.name} loading="lazy" /></Link>{product.badge && <span className="product-badge">{product.badge}</span>}<button className={`wishlist-btn ${saved ? "saved" : ""}`} onClick={() => toggleWishlist(product.id)} aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}><Heart size={17} fill={saved ? "currentColor" : "none"} /></button><button className="quick-add" onClick={() => addToCart(product.id)}>Quick add <Plus size={14} /></button></div>
    <div className="product-copy"><div className="product-meta"><span>{product.category}</span><span>★ {product.rating}</span></div><Link href={`/product/${product.id}`} className="product-name">{product.name}</Link><p>{product.subtitle}</p><div className="price-row"><strong>{formatPKR(product.price)}</strong><del>{formatPKR(product.compareAt)}</del><span className="discount-pill">-{getDiscount(product)}%</span></div></div>
  </article>;
}

export function PageShell({ children, title, intro, className = "" }: { children: ReactNode; title?: string; intro?: string; className?: string }) {
  return <><Header /><main className={`page-shell ${className}`}>{title && <div className="page-intro container"><span className="eyebrow">BazaarPK / Demo catalog</span><h1>{title}</h1>{intro && <p>{intro}</p>}</div>}{children}</main><Footer /></>;
}

export function Footer() {
  return <footer className="site-footer"><div className="container footer-grid"><div className="footer-brand"><Mark /><p>Thoughtful things, chosen for the way you live. Curated in Pakistan, delivered nationwide.</p><div className="socials"><span>ig</span><span>fb</span><span>tk</span><span>wa</span></div></div><div><h4>Explore</h4><Link href="/shop">All pieces</Link><Link href="/shop?category=womens-fashion">Women's fashion</Link><Link href="/shop?category=mens-fashion">Men's fashion</Link><Link href="/shop?category=traditional">Traditional wear</Link></div><div><h4>We’re here</h4><a href="#shipping">Shipping & returns</a><a href="#care">Care guide</a><a href="#help">Help centre</a><a href="#contact">Contact us</a></div><div className="newsletter"><h4>Stay in the loop</h4><p>New drops, considered offers, no noise.</p><div className="newsletter-input"><input placeholder="Your email address" type="email" /><button aria-label="Subscribe"><ArrowRight size={17} /></button></div><small>By subscribing, you agree to our privacy policy.</small></div></div><div className="footer-bottom container"><span>© 2026 BazaarPK. Demo store for preview.</span><span>Made for Pakistan <span className="footer-dot">•</span> PKR prices</span></div></footer>;
}

export function TrustStrip() {
  return <div className="trust-strip"><div><Sparkles size={17} /><span><b>Curated with intent</b><small>Thoughtful edits, made in Pakistan</small></span></div><div><span className="trust-icon">↗</span><span><b>Delivery, nationwide</b><small>Free over Rs. 3,000</small></span></div><div><span className="trust-icon">⌁</span><span><b>Easy returns</b><small>7 days, no questions asked</small></span></div><div><span className="trust-icon">◈</span><span><b>COD available</b><small>Pay when it arrives</small></span></div></div>;
}
