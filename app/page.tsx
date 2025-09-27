import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MainFeed } from "@/components/main-feed"
import { Sidebar } from "@/components/sidebar"
import { StoriesBar } from "@/components/stories-bar"

export default async function HomePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="max-w-2xl mx-auto px-4 py-8">
            {/* Stories */}
            <StoriesBar />

            {/* Feed */}
            <MainFeed />
          </div>
        </main>
      </div>
    </div>
  )
}
