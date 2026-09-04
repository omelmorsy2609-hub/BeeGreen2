import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/sections/hero"
import { FeaturesSection } from "@/components/sections/features"
import { AboutSection } from "@/components/sections/about"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <Footer />
    </main>
  )
}
