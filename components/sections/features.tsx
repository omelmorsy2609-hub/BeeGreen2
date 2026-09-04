"use client"

import { Type, ImageIcon, View, FlaskConical, ShoppingBag } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function FeaturesSection() {
  const { t } = useLanguage()

  const features = [
    {
      icon: Type,
      title: t("features.textToStl.title"),
      description: t("features.textToStl.desc"),
      category: t("designTool.textTab"),
    },
    {
      icon: ImageIcon,
      title: t("features.imageToStl.title"),
      description: t("features.imageToStl.desc"),
      category: t("designTool.imageTab"),
    },
    {
      icon: View,
      title: t("features.viewer.title"),
      description: t("features.viewer.desc"),
      category: t("designTool.preview"),
    },
    {
      icon: FlaskConical,
      title: t("features.generator.title"),
      description: t("features.generator.desc"),
      category: t("filaments.generator.title"),
    },
    {
      icon: ShoppingBag,
      title: t("features.marketplace.title"),
      description: t("features.marketplace.desc"),
      category: t("filaments.title"),
    },
  ]

  return (
    <section className="border-t border-border bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-accent">
            {t("features.title")}
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t("features.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            {t("features.subtitle")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-colors hover:border-accent/50 hover:bg-secondary"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary group-hover:bg-accent/10">
                <feature.icon className="h-6 w-6 text-accent" />
              </div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {feature.category}
              </p>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
