"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";

const links = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/wishlist", label: "Wishlist" },
];

export default function AccountLayout({ children }) {
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
    <div className="mx-auto max-w-content px-4 py-10">
      <h1 className="text-2xl">My account</h1>
      <div className="mt-8 grid gap-8 md:grid-cols-4">
        <nav className="flex flex-row gap-2 md:flex-col" aria-label="Account">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-2 text-sm ${pathname === l.href ? "bg-kiyomi-ink text-white" : "hover:bg-kiyomi-sand"}`}
            >
              {l.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-left text-sm text-kiyomi-muted hover:bg-kiyomi-sand">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </nav>
        <div className="md:col-span-3">{children}</div>
      </div>
    </div>
  );
}