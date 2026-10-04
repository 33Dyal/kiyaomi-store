"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, LayoutDashboard, Package, ShoppingBag, Users, Warehouse, Settings, LifeBuoy, Star, Undo2 } from "lucide-react";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/returns", label: "Returns", icon: Undo2 },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/support", label: "Support", icon: LifeBuoy },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    queryClient.setQueryData(["current-user"], null);
    queryClient.invalidateQueries({ queryKey: ["current-user"] });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 flex-shrink-0 border-r border-kiyomi-sandDark bg-kiyomi-ink text-white">
        <div className="px-5 py-6">
          <span className="text-lg tracking-wide">KIYOMI ADMIN</span>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded px-3 py-2 text-sm ${
                  active ? "bg-white/10" : "hover:bg-white/5 text-white/80"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="mt-4 flex items-center gap-3 rounded px-3 py-2 text-left text-sm text-white/60 hover:bg-white/5"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </nav>
      </aside>
      {/* Pages under /admin may call useSearchParams(); production builds
          require a Suspense boundary around them. */}
      <main className="flex-1 bg-kiyomi-sand p-8">
        <Suspense fallback={null}>{children}</Suspense>
      </main>
    </div>
  );
}