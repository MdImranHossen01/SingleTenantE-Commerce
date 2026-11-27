'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Search,
  ShoppingCart,
  Truck,
  User,
  Tag,
  ChevronRight,
  LayoutDashboard,
  Package,
  LogOut,
  X,
  Info,
  BookOpen,
  Phone,
  ShoppingBag,
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { useSettings } from '@/components/SettingsProvider';
import { Logo } from '@/components/ui/logo';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const SEARCH_HINTS = ['Honey', 'Mustard Oil', 'Ghee', 'Dates', 'Spices', 'Nuts'];

export default function NavbarFalak() {
  const pathname = usePathname();
  const router = useRouter();
  const settings = useSettings();
  const { data: session } = useSession();
  const { totalQuantity: cartCount } = useAppSelector((state) => state.cart);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [liveResults, setLiveResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [categories, setCategories] = useState<any[]>(() =>
    (settings?.categories || []).filter((c: any) => c.isActive !== false)
  );

  useEffect(() => {
    if (settings?.categories) {
      setCategories(settings.categories.filter((c: any) => c.isActive !== false));
      return;
    }
    const controller = new AbortController();
    fetch('/api/categories', { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCategories(Array.isArray(data) ? data.filter((c: any) => c.isActive !== false) : []))
      .catch(() => {});
    return () => controller.abort();
  }, [settings?.categories]);

  const rootCategories = categories.filter((c) => !c.parentCategory);
  const getSubCategories = (parentId: string) =>
    categories.filter((c) => {
      const pId = typeof c.parentCategory === 'object' ? c.parentCategory?._id : c.parentCategory;
      return String(pId) === String(parentId);
    });

  // Track scroll for sticky category bar mini-logo reveal
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 80);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Rotate search hint label
  useEffect(() => {
    const interval = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % SEARCH_HINTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Live search debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setLiveResults([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(trimmed)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setLiveResults(data.products || []);
          setShowDropdown(true);
        }
      } catch {
        // silent
      } finally {
        setIsSearching(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
    setShowDropdown(false);
    setMobileOpen(false);
  };

  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === 'admin' || userRole === 'super_admin' || userRole === 'manager';

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/blog', label: 'Blog' },
    { href: '/shop', label: 'Shop' },
  ];

  return (
    <>
      {/* ── Desktop Main Header ───────────────────────────────────────── */}
      <header className="bg-background">
        <div className="relative z-40 hidden shadow-xs lg:block lg:bg-background">
          <div className="border-b border-border/60">
            <div className="container mx-auto px-4 flex h-20 items-center">
              {/* Brand Logo */}
              <Link href="/" className="shrink-0">
                <Logo />
              </Link>

              {/* Main Desktop Navigation */}
              <nav aria-label="Main desktop navigation" className="ml-10">
                <ul className="flex items-center gap-8">
                  {navLinks.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.href} className="list-none">
                        <Link
                          href={item.href}
                          className={`text-[16px] leading-6 font-semibold transition-colors ${
                            isActive
                              ? 'text-primary'
                              : 'text-muted-foreground hover:text-primary'
                          }`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                  <li className="list-none">
                    <Link
                      href="/shop?filter=deals"
                      className="inline-flex items-center gap-1.5 text-[16px] leading-6 font-semibold text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Tag className="h-3.5 w-3.5" />
                      <span>Offers</span>
                      <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-3.5 tracking-[0.5px] text-destructive">
                        New
                      </span>
                    </Link>
                  </li>
                </ul>
              </nav>

              {/* Desktop Pill Search Input */}
              <div
                ref={searchContainerRef}
                className="ml-auto relative w-[340px] xl:w-[414px] h-10"
              >
                <form
                  onSubmit={handleSearchSubmit}
                  role="search"
                  className="relative h-full w-full"
                >
                  {!searchTerm && !isFocused && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 inline-flex items-center text-[14px] leading-5.5 text-muted-foreground whitespace-nowrap"
                    >
                      <span>Search {SEARCH_HINTS[hintIndex]}</span>
                      <span className="ml-px inline-block h-[18px] w-px shrink-0 bg-primary animate-pulse" />
                    </span>
                  )}
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => {
                      setIsFocused(true);
                      if (liveResults.length > 0) setShowDropdown(true);
                    }}
                    onBlur={() => setIsFocused(false)}
                    aria-label="Search products"
                    className="h-full w-full rounded-full border border-primary bg-background pl-4 pr-12 text-[14px] leading-5.5 text-foreground outline-none transition-shadow focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="submit"
                    aria-label="Submit search"
                    className="absolute right-1 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </form>

                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-popover text-popover-foreground border border-border rounded-xl shadow-xl overflow-hidden z-50">
                    {isSearching ? (
                      <div className="p-4 text-center text-xs text-muted-foreground">Searching...</div>
                    ) : liveResults.length > 0 ? (
                      <ul className="divide-y divide-border/60 max-h-80 overflow-y-auto">
                        {liveResults.map((p: any) => (
                          <li key={p._id}>
                            <Link
                              href={`/product/${p.slug}`}
                              onClick={() => setShowDropdown(false)}
                              className="flex items-center gap-3 p-2.5 hover:bg-muted/60 transition-colors"
                            >
                              <div className="relative w-10 h-10 rounded-md bg-muted shrink-0 overflow-hidden">
                                {p.images?.[0] && (
                                  <Image
                                    src={p.images[0]}
                                    alt={p.name}
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                  />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                                <p className="text-xs font-semibold text-primary">
                                  ৳{p.salePrice && p.salePrice < p.price ? p.salePrice : p.price}
                                </p>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 text-center text-xs text-muted-foreground">No products found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Circular Gradient-Bordered Action Icons */}
              <div className="ml-7 flex items-end gap-6 shrink-0">
                <CartDrawer>
                  <button
                    type="button"
                    aria-label="Shopping cart"
                    className="group relative flex flex-col items-center gap-[6px] bg-transparent p-0 text-muted-foreground duration-150 cursor-pointer"
                  >
                    <span className="relative inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-background/60 text-foreground group-hover:border-primary transition-colors">
                      <ShoppingCart className="h-4 w-4 stroke-[1.7]" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center leading-none">
                          {cartCount}
                        </span>
                      )}
                    </span>
                    <span className="text-[12px] leading-4.5 transition-colors duration-150 group-hover:text-primary">
                      Cart
                    </span>
                  </button>
                </CartDrawer>

                <Link
                  href="/track-order"
                  aria-label="Track order"
                  className="group flex flex-col items-center gap-[6px] text-muted-foreground no-underline duration-150"
                >
                  <span className="relative inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-background/60 text-foreground group-hover:border-primary transition-colors">
                    <Truck className="h-4 w-4 stroke-[1.7]" />
                  </span>
                  <span className="text-center text-[12px] leading-4.5 transition-colors duration-150 group-hover:text-primary whitespace-nowrap">
                    Track Order
                  </span>
                </Link>

                {session ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <button
                          type="button"
                          aria-label="Account"
                          className="group flex flex-col items-center gap-[6px] text-muted-foreground duration-150 outline-none cursor-pointer"
                        />
                      }
                    >
                      <span className="relative inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-background/60 text-foreground group-hover:border-primary transition-colors">
                        <User className="h-4 w-4 stroke-[1.7]" />
                      </span>
                      <span className="text-[12px] leading-4.5 transition-colors duration-150 group-hover:text-primary max-w-[68px] truncate">
                        {session.user?.name?.split(' ')[0] || 'Account'}
                      </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-lg">
                      <DropdownMenuLabel className="text-xs truncate">
                        {session.user?.email}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        {isAdmin && (
                          <DropdownMenuItem onClick={() => router.push('/admin')}>
                            <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Panel
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => router.push('/dashboard/orders')}>
                          <Package className="mr-2 h-4 w-4" /> My Orders
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                          <User className="mr-2 h-4 w-4" /> Profile
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="text-destructive focus:text-destructive"
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link prefetch={false}
                    href="/login"
                    aria-label="Sign in"
                    className="group flex flex-col items-center gap-[6px] text-muted-foreground no-underline duration-150"
                  >
                    <span className="relative inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-background/60 text-foreground group-hover:border-primary transition-colors">
                      <User className="h-4 w-4 stroke-[1.7]" />
                    </span>
                    <span className="text-[12px] leading-4.5 transition-colors duration-150 group-hover:text-primary whitespace-nowrap">
                      Sign In
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Desktop Sticky Category Bar ───────────────────────────────── */}
      <div className="sticky top-0 z-30 hidden border-b border-border/60 bg-background lg:block">
        <nav aria-label="Category navigation" className="h-12 w-full">
          <div className="container mx-auto px-4 flex h-full items-center">
            {/* Scroll-revealed Mini Logo */}
            <Link
              href="/"
              aria-label="Home"
              className={`mr-5 xl:mr-8 flex shrink-0 items-center transition-[opacity,visibility] duration-200 ${
                isScrolled ? 'visible opacity-100' : 'invisible opacity-0 pointer-events-none w-0 mr-0 xl:mr-0 overflow-hidden'
              }`}
            >
              <Logo />
            </Link>

            <ul className="flex h-full min-w-0 flex-1 items-center justify-center gap-4 min-[1100px]:gap-7 xl:gap-10">
              {rootCategories.slice(0, 9).map((cat) => {
                const subs = getSubCategories(cat._id);
                return (
                  <li key={cat._id} className="relative group list-none">
                    <Link
                      href={`/shop?category=${encodeURIComponent(cat.slug)}`}
                      className="inline-flex h-12 items-center gap-1 whitespace-nowrap border-b-2 border-transparent px-0 text-[15px] xl:text-[16px] font-semibold leading-6 text-foreground transition-[border-color,color] duration-150 hover:border-primary hover:text-primary"
                    >
                      <span>{cat.name}</span>
                    </Link>

                    {subs.length > 0 && (
                      <ul className="absolute left-0 top-full min-w-[200px] bg-popover text-popover-foreground border border-border rounded-b-lg shadow-xl py-1.5 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-150 z-50">
                        {subs.map((sub) => (
                          <li key={sub._id}>
                            <Link
                              href={`/shop?category=${encodeURIComponent(sub.slug)}`}
                              className="block px-4 py-2 text-sm text-foreground/90 hover:bg-muted hover:text-primary transition-colors"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </div>

      {/* ── Mobile Sticky Header ──────────────────────────────────────── */}
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background shadow-xs lg:hidden">
        <div className="container mx-auto px-3 sm:px-4 flex flex-col gap-3 pb-4 pt-3.5">
          <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3">
            {/* Mobile Drawer Trigger */}
            <div className="flex min-w-0 items-center justify-start">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger
                  render={
                    <button
                      type="button"
                      aria-label="Open menu"
                      className="flex h-6 w-6 shrink-0 flex-col justify-center gap-1 bg-transparent p-0 [&>span]:block [&>span]:h-0.5 [&>span]:w-5 [&>span]:bg-foreground"
                    />
                  }
                >
                  <span />
                  <span />
                  <span />
                </SheetTrigger>

                <SheetContent side="left" className="w-[291px] max-w-[85vw] p-0 flex flex-col">
                  <div className="flex flex-col px-4 pb-8 pt-4 overflow-y-auto flex-1">
                    {/* Top Close + Sign In Banner Card */}
                    <div className="flex justify-end mb-2">
                      <button
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        aria-label="Close menu"
                        className="p-1 rounded-full hover:bg-muted text-muted-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <Link
                      href={session ? '/dashboard/orders' : '/login'}
                      onClick={() => setMobileOpen(false)}
                      className="relative flex h-16 w-full items-center overflow-hidden rounded-lg bg-primary text-primary-foreground no-underline"
                    >
                      <div className="flex w-full items-center gap-3 px-3.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20">
                          <User className="h-4 w-4" />
                        </span>
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[18px]">
                          <span className="text-[12px] font-semibold truncate">
                            {session ? `Hi, ${session.user?.name || 'Customer'}` : 'Hello, what are you looking for?'}
                          </span>
                          <span className="text-[12px] opacity-90">
                            {session ? 'View My Orders' : 'Sign In'}
                          </span>
                        </div>
                      </div>
                    </Link>

                    {/* Categories List */}
                    <nav aria-label="Shop by category" className="mt-7 flex flex-col gap-4">
                      {rootCategories.map((cat) => (
                        <Link
                          key={cat._id}
                          href={`/shop?category=${encodeURIComponent(cat.slug)}`}
                          onClick={() => setMobileOpen(false)}
                          className="flex w-full items-center justify-between gap-2 text-[16px] leading-6 text-muted-foreground hover:text-primary"
                        >
                          <span>{cat.name}</span>
                        </Link>
                      ))}
                    </nav>

                    {/* Additional Pages */}
                    <nav
                      aria-label="Additional pages"
                      className="mt-6 flex flex-col gap-4 border-t border-border pt-6"
                    >
                      <Link
                        href="/about"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 text-[16px] leading-6 text-muted-foreground hover:text-primary"
                      >
                        <Info className="h-4 w-4" /> About us
                      </Link>
                      <Link
                        href="/blog"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 text-[16px] leading-6 text-muted-foreground hover:text-primary"
                      >
                        <BookOpen className="h-4 w-4" /> Blog
                      </Link>
                    </nav>

                    {/* Quick Action Box */}
                    <div className="mt-8">
                      <h2 className="m-0 text-[18px] font-bold leading-7 text-foreground">Quick Action</h2>
                      <div className="mt-0.5 h-px w-[146px] bg-primary" />
                      <div className="mt-4 flex flex-col gap-4 rounded-md bg-muted/50 px-4 py-4">
                        <Link
                          href="/shop"
                          onClick={() => setMobileOpen(false)}
                          className="flex w-full items-center justify-between gap-2 text-[15px] font-semibold text-foreground hover:text-primary"
                        >
                          <span className="flex items-center gap-2.5">
                            <ShoppingBag className="h-5 w-5" />
                            <span>Shop</span>
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                        <Link
                          href="/contact"
                          onClick={() => setMobileOpen(false)}
                          className="flex w-full items-center justify-between gap-2 text-[15px] font-semibold text-foreground hover:text-primary"
                        >
                          <span className="flex items-center gap-2.5">
                            <Phone className="h-5 w-5" />
                            <span>Contact Us</span>
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                        <Link
                          href={session ? '/dashboard/profile' : '/login'}
                          onClick={() => setMobileOpen(false)}
                          className="flex w-full items-center justify-between gap-2 text-[15px] font-semibold text-foreground hover:text-primary"
                        >
                          <span className="flex items-center gap-2.5">
                            <User className="h-5 w-5" />
                            <span>{session ? 'Profile' : 'Sign In'}</span>
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Center Mobile Logo */}
            <Link href="/" className="flex shrink-0 items-center justify-center">
              <Logo />
            </Link>

            {/* Right Track Order Icon */}
            <div className="flex min-w-0 items-center justify-end">
              <Link
                href="/track-order"
                aria-label="Track order"
                className="relative flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-background/60 text-foreground"
              >
                <Truck className="h-4 w-4 stroke-[1.7]" />
              </Link>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <form onSubmit={handleSearchSubmit} role="search" className="h-10 relative w-full">
            {!searchTerm && !isFocused && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 inline-flex items-center text-[14px] leading-[22px] text-muted-foreground whitespace-nowrap"
              >
                <span>Search {SEARCH_HINTS[hintIndex]}</span>
                <span className="ml-px inline-block h-[18px] w-px shrink-0 bg-primary animate-pulse" />
              </span>
            )}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              aria-label="Search products"
              className="h-full w-full rounded-full border border-primary bg-background pl-4 pr-12 text-[14px] leading-[22px] text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              aria-label="Submit search"
              className="absolute right-1 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-primary"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
