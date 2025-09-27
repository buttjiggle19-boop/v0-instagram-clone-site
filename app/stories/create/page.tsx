import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CreateStoryForm } from "@/components/create-story-form"
import { Sidebar } from "@/components/sidebar"

export default async function CreateStoryPage() {
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
          <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-8">Create Story</h1>
            <CreateStoryForm />
          </div>
        </main>
      </div>
    </div>
  )
}
