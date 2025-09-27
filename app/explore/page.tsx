import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ExploreGrid } from "@/components/explore-grid"
import { Sidebar } from "@/components/sidebar"

export default async function ExplorePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-8">Explore</h1>
            <ExploreGrid />
          </div>
        </main>
      </div>
    </div>
  )
}
