import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FilamentsMarketplace, Filament } from "@/components/filaments-marketplace"
import { FilamentsHeader } from "@/components/sections/filaments-header"
import { createClient } from "@/lib/supabase/server"

export default async function FilamentsPage() {
  const supabase = await createClient()

  const { data: filaments, error } = await supabase
    .from("filaments")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching filaments:", error)
  }

  const products: Filament[] = filaments || []

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <div className="mx-auto max-w-7xl px-6 pb-24 pt-32">
        <FilamentsHeader />
        <FilamentsMarketplace initialFilaments={products} />
      </div>

      <Footer />
    </main>
  )
}
