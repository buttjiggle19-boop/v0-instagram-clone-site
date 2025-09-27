import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SearchInterface } from "@/components/search-interface"
import { Sidebar } from "@/components/sidebar"

export default async function SearchPage() {
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
          <div className="max-w-4xl mx-auto px-4 py-8">
            <SearchInterface />
          </div>
        </main>
      </div>
    </div>
  )
}
