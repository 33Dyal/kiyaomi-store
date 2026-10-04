"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, Heart, ShoppingBag, User, Menu, X } from "lucide-react";
import { brand } from "@/lib/brand";
import { useCartStore } from "@/stores/cart-store";
import { CartDrawer } from "@/components/cart/cart-drawer";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/shop?sort=newest", label: "New arrivals" },
  { href: "/shop?sort=bestselling", label: "Best sellers" },
  { href: "/categories", label: "Categories" },
  { href: "/info", label: "info" },
  { href: "/support", label: "Contact" },
];

const DEFAULT_ANNOUNCEMENT = "Free delivery within Nairobi on orders over KES 5,000";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount());
  const pathname = usePathname();

  const { data: settings } = useQuery({
    queryKey: ["public-settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      const json = await res.json();
      return json.success ? json.data : null;
    },
    staleTime: 10 * 60 * 1000, // store settings rarely change; avoid refetching constantly
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayCount = mounted ? itemCount : 0;

  // Compares against pathname only (ignores query strings like ?sort=newest)
  const isActive = (href) => {
    const [hrefPath] = href.split("?");
    return pathname === hrefPath;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-kiyomi-sandDark">
      <div className="bg-kiyomi-ink py-2 text-center text-xs tracking-wide text-kiyomi-cream">
        {settings?.announcement || DEFAULT_ANNOUNCEMENT}
      </div>
      <div className="mx-auto flex max-w-content items-center justify-between px-4 py-4">
        <button className="md:hidden text-kiyomi-ink" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link href="/" className="font-display text-xl tracking-widest text-kiyomi-ink">
          {settings?.storeName ? settings.storeName.split(" ")[0].toUpperCase() : brand.shortName.toUpperCase()}
        </Link>

        <nav className="hidden gap-6 text-sm md:flex" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                isActive(l.href)
                  ? "border-b-2 border-kiyomi-ink pb-1 text-kiyomi-ink"
                  : "border-b-2 border-transparent pb-1 text-kiyomi-ink hover:text-kiyomi-terracotta"
              }
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-kiyomi-ink">
          <Link href="/search" aria-label="Search"><Search className="h-5 w-5" /></Link>
          <Link href="/wishlist" aria-label="Wishlist"><Heart className="h-5 w-5" /></Link>
          <Link href="/account" aria-label="Account"><User className="h-5 w-5" /></Link>
          <button onClick={() => setCartOpen(true)} aria-label={`Cart, ${displayCount} items`} className="relative">
            <ShoppingBag className="h-5 w-5" />
            {mounted && itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-kiyomi-terracotta text-[10px] text-white">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-kiyomi-sandDark px-4 py-3 md:hidden" aria-label="Mobile">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                isActive(l.href)
                  ? "border-b-2 border-kiyomi-ink py-2 text-sm text-kiyomi-ink w-fit"
                  : "py-2 text-sm text-kiyomi-ink"
              }
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}