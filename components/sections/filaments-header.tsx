"use client"

import { useLanguage } from "@/lib/language-context"

export function FilamentsHeader() {
  const { t } = useLanguage()
  return (
    <div className="mb-12 text-center">
      <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        {t("filaments.title")}
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
        {t("filaments.subtitle")}
      </p>
    </div>
  )
}
