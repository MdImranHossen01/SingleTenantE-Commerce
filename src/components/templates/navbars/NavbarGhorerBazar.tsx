'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Search,
  MapPin,
  User,
  Heart,
  ShoppingCart,
  AlignJustify,
  Menu,
  ChevronDown,
  Sparkles,
  Phone,
  MessageCircle,
  HelpCircle,
  Info,
  LayoutDashboard,
  LogOut,
  Package,
  X,
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { useSettings } from '@/components/SettingsProvider';
import { Logo } from '@/components/ui/logo';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { ModeToggle } from '@/components/mode-toggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function NavbarGhorerBazar() {
  const router = useRouter();
  const settings = useSettings();
  const { data: session } = useSession();
  const { totalQuantity: cartCount } = useAppSelector((state) => state.cart);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const wishlistCount = wishlistItems.length;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [liveResults, setLiveResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
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
  const phone = settings?.contact?.phone;
  const whatsappRaw = settings?.socialLinks?.whatsapp || '';
  const whatsappUrl = whatsappRaw
    ? whatsappRaw.startsWith('http')
      ? whatsappRaw
      : `https://wa.me/${whatsappRaw.replace(/[^0-9]/g, '')}`
    : null;

  return (
    <>
      {/* ── Top / Middle Bar (Logo, Search, Actions) ────────────────────── */}
      <header className="bg-background text-foreground border-b border-border/80 relative z-40">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between gap-3 md:gap-6 py-2.5 lg:py-3.5">
            {/* Left: Mobile Menu + Logo */}
            <div className="flex items-center gap-2.5 shrink-0">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger
                  render={
                    <button
                      type="button"
                      aria-label="Open menu"
                      className="lg:hidden p-1.5 -ml-1 rounded-md text-foreground hover:bg-muted transition-colors"
                    />
                  }
                >
                  <Menu className="h-5 w-5" />
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[340px] p-0 flex flex-col">
                  <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
                    <Logo />
                    <button
                      type="button"
                      onClick={() => setMobileOpen(false)}
                      aria-label="Close menu"
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                    <Link
                      href="/shop?filter=deals"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between py-2.5 px-2 rounded-md text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                    >
                      <span>Offer Zone</span>
                    </Link>

                    <Link
                      href="/shop?filter=flash"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 py-2.5 px-2 rounded-md text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Flash Sale</span>
                    </Link>

                    <Accordion type="single" collapsible className="w-full">
                      {rootCategories.map((cat) => {
                        const subs = getSubCategories(cat._id);
                        if (subs.length === 0) {
                          return (
                            <Link
                              key={cat._id}
                              href={`/shop?category=${encodeURIComponent(cat.slug)}`}
                              onClick={() => setMobileOpen(false)}
                              className="block py-2.5 px-2 text-sm font-medium text-foreground hover:text-primary border-b border-border/50"
                            >
                              {cat.name}
                            </Link>
                          );
                        }
                        return (
                          <AccordionItem key={cat._id} value={cat._id} className="border-b border-border/50">
                            <AccordionTrigger className="py-2.5 px-2 text-sm font-medium hover:no-underline hover:text-primary">
                              {cat.name}
                            </AccordionTrigger>
                            <AccordionContent className="pb-2 pl-4 space-y-1">
                              <Link
                                href={`/shop?category=${encodeURIComponent(cat.slug)}`}
                                onClick={() => setMobileOpen(false)}
                                className="block py-1.5 text-xs font-semibold text-primary"
                              >
                                All {cat.name}
                              </Link>
                              {subs.map((sub) => (
                                <Link
                                  key={sub._id}
                                  href={`/shop?category=${encodeURIComponent(sub.slug)}`}
                                  onClick={() => setMobileOpen(false)}
                                  className="block py-1.5 text-xs text-muted-foreground hover:text-primary"
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>

                    <div className="pt-4 border-t border-border space-y-1">
                      <Link
                        href="/track-order"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2.5 py-2 px-2 text-sm text-foreground/80 hover:text-primary"
                      >
                        <MapPin className="h-4 w-4" /> Track Order
                      </Link>
                      <Link
                        href="/faq"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2.5 py-2 px-2 text-sm text-foreground/80 hover:text-primary"
                      >
                        <HelpCircle className="h-4 w-4" /> FAQs
                      </Link>
                      <Link
                        href="/about"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2.5 py-2 px-2 text-sm text-foreground/80 hover:text-primary"
                      >
                        <Info className="h-4 w-4" /> About Us
                      </Link>
                      {phone && (
                        <a
                          href={`tel:${phone}`}
                          className="flex items-center gap-2.5 py-2 px-2 text-sm text-foreground/80 hover:text-primary"
                        >
                          <Phone className="h-4 w-4" /> Call Us
                        </a>
                      )}
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 py-2 px-2 text-sm text-foreground/80 hover:text-primary"
                        >
                          <MessageCircle className="h-4 w-4" /> WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <Link href="/" className="flex items-center shrink-0">
                <Logo />
              </Link>
            </div>

            {/* Center: Desktop Search Bar */}
            <div ref={searchContainerRef} className="hidden md:block flex-1 max-w-xl mx-auto relative">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center w-full h-10 rounded-md bg-muted/60 border border-border/80 focus-within:border-primary focus-within:bg-background transition-all overflow-hidden"
              >
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => {
                    if (liveResults.length > 0) setShowDropdown(true);
                  }}
                  placeholder="Search in..."
                  aria-label="Search products"
                  className="flex-1 h-full bg-transparent px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="h-full px-3.5 text-muted-foreground hover:text-primary transition-colors flex items-center justify-center"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>

              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-popover text-popover-foreground border border-border rounded-lg shadow-xl overflow-hidden z-50">
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
                            <div className="relative w-10 h-10 rounded bg-muted shrink-0 overflow-hidden">
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

            {/* Right: Icon-Top + Label-Below Actions */}
            <div className="flex items-center gap-3.5 sm:gap-5 lg:gap-6 shrink-0">
              <Link
                href="/track-order"
                className="hidden sm:flex flex-col items-center gap-0.5 text-foreground/80 hover:text-primary transition-colors"
              >
                <MapPin className="h-5 w-5 stroke-[1.6]" />
                <span className="hidden lg:block text-[11px] font-medium leading-tight">Track Order</span>
              </Link>

              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button
                        type="button"
                        className="flex flex-col items-center gap-0.5 text-foreground/80 hover:text-primary transition-colors outline-none"
                      />
                    }
                  >
                    <User className="h-5 w-5 stroke-[1.6]" />
                    <span className="hidden lg:block text-[11px] font-medium leading-tight max-w-[70px] truncate">
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
                <Link
                  href="/login"
                  className="flex flex-col items-center gap-0.5 text-foreground/80 hover:text-primary transition-colors"
                >
                  <User className="h-5 w-5 stroke-[1.6]" />
                  <span className="hidden lg:block text-[11px] font-medium leading-tight">Sign In</span>
                </Link>
              )}

              <Link
                href="/dashboard/wishlist"
                className="hidden xs:flex sm:flex flex-col items-center gap-0.5 text-foreground/80 hover:text-primary transition-colors relative"
              >
                <div className="relative">
                  <Heart className="h-5 w-5 stroke-[1.6]" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[9px] font-bold min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <span className="hidden lg:block text-[11px] font-medium leading-tight">Wishlist</span>
              </Link>

              <CartDrawer>
                <button
                  type="button"
                  aria-label="Open Cart"
                  className="flex flex-col items-center gap-0.5 text-foreground/80 hover:text-primary transition-colors cursor-pointer"
                >
                  <div className="relative">
                    <ShoppingCart className="h-5 w-5 stroke-[1.6]" />
                    <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[10px] font-bold min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center leading-none">
                      {cartCount}
                    </span>
                  </div>
                  <span className="hidden lg:block text-[11px] font-medium leading-tight">Cart</span>
                </button>
              </CartDrawer>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      aria-label="More options"
                      className="hidden md:flex flex-col items-center gap-0.5 text-foreground/80 hover:text-primary transition-colors outline-none"
                    />
                  }
                >
                  <AlignJustify className="h-5 w-5 stroke-[1.6]" />
                  <span className="hidden lg:block text-[11px] font-medium leading-tight">More</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-lg">
                  <DropdownMenuItem onClick={() => router.push('/dashboard/wishlist')}>
                    <Heart className="mr-2 h-4 w-4 text-primary" /> Wishlists
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/faq')}>
                    <HelpCircle className="mr-2 h-4 w-4 text-primary" /> FAQs
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/about')}>
                    <Info className="mr-2 h-4 w-4 text-primary" /> About Us
                  </DropdownMenuItem>
                  {phone && (
                    <DropdownMenuItem render={<a href={`tel:${phone}`} />}>
                      <Phone className="mr-2 h-4 w-4 text-primary" /> Call Us
                    </DropdownMenuItem>
                  )}
                  {whatsappUrl && (
                    <DropdownMenuItem
                      render={<a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />}
                    >
                      <MessageCircle className="mr-2 h-4 w-4 text-primary" /> WhatsApp
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Theme</span>
                    <ModeToggle />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="md:hidden pb-2.5 flex items-center"
          >
            <div className="flex items-center w-full h-9 rounded-md bg-muted/60 border border-border/80 focus-within:border-primary overflow-hidden">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search in..."
                aria-label="Search products"
                className="flex-1 h-full bg-transparent px-3 text-xs text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button
                type="submit"
                aria-label="Search"
                className="h-full px-3 text-muted-foreground hover:text-primary"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </header>

      {/* ── Bottom Sticky Category Bar (Desktop) ────────────────────────── */}
      <div className="hidden lg:block sticky top-0 z-30 bg-foreground text-background dark:bg-card dark:text-card-foreground dark:border-b dark:border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 h-11">
            <nav className="flex items-center min-w-0">
              <ul className="flex items-center gap-3.5 xl:gap-5 text-[12.5px] xl:text-[13px] font-medium">
                <li className="shrink-0">
                  <Link
                    href="/shop?filter=deals"
                    className="hover:text-primary transition-colors whitespace-nowrap py-2.5 inline-block"
                  >
                    Offer Zone
                  </Link>
                </li>

                {rootCategories.map((cat) => {
                  const subs = getSubCategories(cat._id);
                  const hasSubs = subs.length > 0;

                  return (
                    <li key={cat._id} className="relative group shrink-0">
                      <Link
                        href={`/shop?category=${encodeURIComponent(cat.slug)}`}
                        className="inline-flex items-center gap-1 hover:text-primary transition-colors whitespace-nowrap py-2.5"
                      >
                        <span>{cat.name}</span>
                        {hasSubs && (
                          <ChevronDown className="h-3.5 w-3.5 opacity-75 group-hover:rotate-180 transition-transform duration-200" />
                        )}
                      </Link>

                      {hasSubs && (
                        <ul className="absolute left-0 top-full min-w-[200px] bg-popover text-popover-foreground border border-border rounded-b-md shadow-xl py-1.5 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-150 z-50">
                          {subs.map((sub) => (
                            <li key={sub._id}>
                              <Link
                                href={`/shop?category=${encodeURIComponent(sub.slug)}`}
                                className="block px-4 py-2 text-[13px] text-foreground/90 hover:bg-muted hover:text-primary transition-colors"
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
            </nav>

            <Link
              href="/shop?filter=flash"
              className="shrink-0 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Flash Sale</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
