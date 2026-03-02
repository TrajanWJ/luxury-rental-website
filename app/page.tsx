import Navigation from "@/components/navigation"
import { HomepageSections } from "@/components/homepage-sections"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HomepageSections />
    </main>
  )
}
