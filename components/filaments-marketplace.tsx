"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { FlaskConical, ShoppingCart, Search, Loader2, Check, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"

export interface Filament {
  id: string
  name: string
  price: number
  image_url: string | null
  color: string
  properties: string[]
  in_stock: boolean
}

interface FilamentsMarketplaceProps {
  initialFilaments: Filament[]
}

export function FilamentsMarketplace({ initialFilaments }: FilamentsMarketplaceProps) {
  const { t, language } = useLanguage()
  const [specInput, setSpecInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSpec, setGeneratedSpec] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [cartItems, setCartItems] = useState<string[]>([])

  const handleGenerateSpec = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setGeneratedSpec(
        language === "ar"
          ? "خلطة هجينة مخصصة:\n• القاعدة: PETG معاد تدويره (60%)\n• المضاف: ألياف الكربون (15%)\n• المعدّل: TPU مرن (25%)\n\nالخصائص:\n• نطاق الحرارة: 235-255°C\n• قوة الشد: عالية\n• المرونة: متوسطة\n• تشطيب السطح: مطفي محبب"
          : "Custom Hybrid Blend:\n• Base: Recycled PETG (60%)\n• Additive: Carbon Fiber (15%)\n• Modifier: Flexible TPU (25%)\n\nProperties:\n• Temp Range: 235-255°C\n• Tensile Strength: High\n• Flexibility: Medium\n• Surface Finish: Matte Granular"
      )
    }, 2000)
  }

  const addToCart = (id: string) => {
    if (!cartItems.includes(id)) {
      setCartItems([...cartItems, id])
    }
  }

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} ${t("filaments.currency")}`
  }

  const filteredProducts = initialFilaments.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      {/* Custom Filament Generator */}
      <div className="mb-16 rounded-xl border border-border bg-card p-6 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <FlaskConical className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {t("filaments.generator.title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("filaments.generator.subtitle")}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <Textarea
              placeholder={t("filaments.generator.placeholder")}
              className="min-h-[140px] resize-none bg-secondary"
              value={specInput}
              onChange={(e) => setSpecInput(e.target.value)}
            />
            <Button
              onClick={handleGenerateSpec}
              disabled={!specInput.trim() || isGenerating}
              className="w-full gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("filaments.generator.generating")}
                </>
              ) : (
                <>
                  {t("filaments.generator.button")}
                  <ArrowLeft className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-secondary p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("filaments.generator.title")}
            </p>
            {generatedSpec ? (
              <div className="space-y-4">
                <pre className="whitespace-pre-wrap font-mono text-sm text-foreground">
                  {generatedSpec}
                </pre>
                <Button variant="outline" className="w-full gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  {t("filaments.addToCart")}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("filaments.generator.subtitle")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Marketplace Section */}
      <div>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {t("filaments.title")}
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("filaments.search")}
              className="bg-secondary pr-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-accent/50"
            >
              {/* Color Preview / Image */}
              <div
                className="flex h-32 items-center justify-center"
                style={{ backgroundColor: product.color }}
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full border-4 border-background/20 bg-gradient-to-br from-white/20 to-transparent" />
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-semibold text-foreground">
                    {product.name}
                  </h3>
                  <span className="text-lg font-bold text-accent">
                    {formatPrice(product.price)}
                  </span>
                </div>

                <div className="mb-3 flex items-center gap-1.5">
                  <span className={cn(
                    "text-xs font-medium",
                    product.in_stock ? "text-green-500" : "text-muted-foreground"
                  )}>
                    {product.in_stock ? t("filaments.inStock") : t("filaments.outOfStock")}
                  </span>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  {(product.properties ?? []).map((prop, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {prop}
                    </span>
                  ))}
                </div>

                <Button
                  variant={cartItems.includes(product.id) ? "secondary" : "default"}
                  className={cn(
                    "w-full gap-2",
                    !product.in_stock && "cursor-not-allowed opacity-50"
                  )}
                  disabled={!product.in_stock}
                  onClick={() => addToCart(product.id)}
                >
                  {!product.in_stock ? (
                    t("filaments.outOfStock")
                  ) : cartItems.includes(product.id) ? (
                    <>
                      <Check className="h-4 w-4" />
                      {t("filaments.addToCart")}
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      {t("filaments.addToCart")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">{t("filaments.noResults")}</p>
          </div>
        )}
      </div>
    </>
  )
}
