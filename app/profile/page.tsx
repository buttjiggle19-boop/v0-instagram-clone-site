import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfileHeader } from "@/components/profile-header"
import { ProfilePosts } from "@/components/profile-posts"
import { Sidebar } from "@/components/sidebar"

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <ProfileHeader profile={profile} isOwnProfile={true} />
            <ProfilePosts userId={profile.id} />
          </div>
        </main>
      </div>
    </div>
  )
}
