import Link from "next/link";
import { brand } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-kiyomi-ink bg-kiyomi-ink text-kiyomi-cream">
      <div className="mx-auto grid max-w-content gap-8 px-4 py-16 md:grid-cols-4">
        <div>
          <p className="font-display text-lg">{brand.shortName}</p>
          <p className="mt-2 text-sm text-kiyomi-muted">{brand.tagline}</p>
          <a href={brand.instagramUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm underline">
            {brand.instagramHandle}
          </a>
        </div>
        <FooterColumn title="Shop" links={[["Shop all", "/shop"], ["New arrivals", "/shop?sort=newest"], ["Sale", "/categories/sale"]]} />
        <FooterColumn title="Support" links={[["Contact", "/support"], ["Shipping", "/shipping"], ["Returns", "/returns"], ["FAQ", "/support#faq"]]} />
        <FooterColumn title="Legal" links={[["Privacy policy", "/privacy"], ["Terms of service", "/terms"], ["Refund policy", "/refund-policy"]]} />
      </div>
      <div className="border-t border-kiyomi-ink px-4 py-4 text-center text-xs text-kiyomi-muted">
        © {new Date().getFullYear()} {brand.name}. All rights reserved.
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <p className="text-sm font-medium text-kiyomi-cream">{title}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-sm text-kiyomi-muted hover:text-kiyomi-cream">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}