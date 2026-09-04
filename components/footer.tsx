"use client"

import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/lib/language-context"

export function Footer() {
  const { t } = useLanguage()

  const footerLinks = {
    [t("footer.product")]: [
      { label: t("nav.designTool"), href: "/design-tool" },
      { label: t("nav.filaments"), href: "/filaments" },
      { label: t("footer.pricing"), href: "#" },
    ],
    [t("footer.company")]: [
      { label: t("footer.about"), href: "/about" },
      { label: t("footer.careers"), href: "#" },
      { label: "Blog", href: "#" },
    ],
    [t("footer.support")]: [
      { label: "Docs", href: "#" },
      { label: t("footer.help"), href: "#" },
      { label: t("footer.contact"), href: "#" },
    ],
    [t("footer.legal")]: [
      { label: t("footer.privacy"), href: "#" },
      { label: t("footer.terms"), href: "#" },
    ],
  }

  return (
    <footer className="border-t border-border bg-background py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt={t("nav.brand")}
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="text-lg font-semibold tracking-tight text-foreground">
                {t("nav.brand")}
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t("footer.desc")}
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-4 text-sm font-semibold text-foreground">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {t("nav.brand")}. {t("footer.rights")}
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Twitter
            </Link>
            <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Discord
            </Link>
            <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
