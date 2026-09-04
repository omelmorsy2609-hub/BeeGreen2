"use client"

import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"

export function HeroSection() {
  const { t } = useLanguage()

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-16">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      {/* Accent Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-accent/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-accent" />
          <span>{t("features.title")}</span>
        </div>

        {/* Headline */}
        <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
          {t("hero.title")}
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
          {t("hero.subtitle")}
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="gap-2">
            <Link href="/design-tool">
              {t("hero.cta.design")}
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/filaments">{t("hero.cta.filaments")}</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 gap-8 border-t border-border pt-10 md:grid-cols-4">
          <div>
            <p className="text-3xl font-bold text-foreground">10K+</p>
            <p className="text-sm text-muted-foreground">{t("hero.stat.models")}</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">98%</p>
            <p className="text-sm text-muted-foreground">{t("hero.stat.filaments")}</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">50+</p>
            <p className="text-sm text-muted-foreground">{t("hero.stat.filaments")}</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">24h</p>
            <p className="text-sm text-muted-foreground">{t("hero.stat.makers")}</p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-muted-foreground/30 p-1.5">
          <div className="h-2 w-1 animate-bounce rounded-full bg-muted-foreground" />
        </div>
      </div>
    </section>
  )
}
