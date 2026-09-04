"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Leaf, Lightbulb, Users, Target, Rocket, Shield } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export default function AboutPage() {
  const { t } = useLanguage()

  const values = [
    { icon: Lightbulb, title: t("aboutPage.values.innovation"), description: t("aboutPage.values.innovation.desc") },
    { icon: Leaf, title: t("aboutPage.values.sustainability"), description: t("aboutPage.values.sustainability.desc") },
    { icon: Users, title: t("aboutPage.values.community"), description: t("aboutPage.values.community.desc") },
    { icon: Target, title: t("aboutPage.values.precision"), description: t("aboutPage.values.precision.desc") },
    { icon: Rocket, title: t("aboutPage.values.speed"), description: t("aboutPage.values.speed.desc") },
    { icon: Shield, title: t("aboutPage.values.quality"), description: t("aboutPage.values.quality.desc") },
  ]

  const team = [
    { name: t("aboutPage.team.member1.name"), role: t("aboutPage.team.member1.role") },
    { name: t("aboutPage.team.member2.name"), role: t("aboutPage.team.member2.role") },
    { name: t("aboutPage.team.member3.name"), role: t("aboutPage.team.member3.role") },
    { name: t("aboutPage.team.member4.name"), role: t("aboutPage.team.member4.role") },
  ]

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden px-6 pt-16">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-accent/10 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-accent">
            {t("aboutPage.title")}
          </p>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            {t("about.subtitle")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            {t("aboutPage.mission.desc")}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="border-t border-border py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-wider text-accent">
                {t("aboutPage.mission.title")}
              </p>
              <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                {t("about.subtitle")}
              </h2>
              <p className="mt-6 text-pretty leading-relaxed text-muted-foreground">
                {t("aboutPage.mission.desc")}
              </p>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl border border-border bg-card p-8">
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="text-6xl font-bold text-accent">2024</div>
                  <p className="mt-2 text-muted-foreground">{t("about.title")}</p>
                  <div className="mt-8 grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-3xl font-bold text-foreground">50K+</p>
                      <p className="text-sm text-muted-foreground">{t("hero.stat.makers")}</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-foreground">1M+</p>
                      <p className="text-sm text-muted-foreground">{t("hero.stat.models")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="border-t border-border bg-secondary py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-2 text-sm font-medium uppercase tracking-wider text-accent">
              {t("aboutPage.values.title")}
            </p>
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {t("about.title")}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {values.map((value, index) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-accent/50"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <value.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{value.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="border-t border-border py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-2 text-sm font-medium uppercase tracking-wider text-accent">
              {t("aboutPage.team.title")}
            </p>
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {t("aboutPage.team.title")}
            </h2>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-4">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
                  <span className="text-2xl font-bold text-accent">
                    {member.name.split(" ").map((n: string) => n[0]).join("")}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground">{member.name}</h3>
                <p className="text-sm text-accent">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
