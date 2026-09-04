"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { ShoppingCart, Menu, X, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"

export function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()

  const navItems = [
    { href: "/about", labelKey: "nav.about" },
    { href: "/filaments", labelKey: "nav.filaments" },
    { href: "/design-tool", labelKey: "nav.designTool" },
  ]

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en")
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt={language === "ar" ? "شعار بي جرين" : "BeeGreen Logo"}
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <span className="text-lg font-semibold tracking-tight text-foreground">
            {t("nav.brand")}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                pathname === item.href
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            <span>{language === "en" ? "العربية" : "English"}</span>
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -start-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
              0
            </span>
          </Button>
          <Button>{t("nav.getStarted")}</Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2"
          >
            <Globe className="h-4 w-4" />
            <span className="text-xs">{language === "en" ? "AR" : "EN"}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="flex flex-col gap-4 px-6 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {t(item.labelKey)}
              </Link>
            ))}
            <div className="flex items-center gap-4 pt-4">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -start-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  0
                </span>
              </Button>
              <Button className="flex-1">{t("nav.getStarted")}</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
