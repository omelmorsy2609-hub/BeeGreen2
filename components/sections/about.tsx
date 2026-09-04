"use client"

import { Leaf, Lightbulb, Users } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function AboutSection() {
  const { t } = useLanguage()

  const values = [
    {
      icon: Lightbulb,
      title: t("about.innovation"),
      description: t("about.innovation.desc"),
    },
    {
      icon: Leaf,
      title: t("about.sustainability"),
      description: t("about.sustainability.desc"),
    },
    {
      icon: Users,
      title: t("about.community"),
      description: t("about.community.desc"),
    },
  ]

  return (
    <section className="border-t border-border bg-secondary py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Text Content */}
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-wider text-accent">
              {t("about.title")}
            </p>
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {t("about.subtitle")}
            </h2>
            <p className="mt-6 text-pretty leading-relaxed text-muted-foreground">
              {t("about.desc")}
            </p>
          </div>

          {/* Values */}
          <div className="space-y-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="flex gap-4 rounded-lg border border-border bg-card p-6"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <value.icon className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-foreground">
                    {value.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
