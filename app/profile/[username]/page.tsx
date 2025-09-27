import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfileHeader } from "@/components/profile-header"
import { ProfilePosts } from "@/components/profile-posts"
import { Sidebar } from "@/components/sidebar"

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
  const { username } = await params
  const supabase = await createClient()

  const { data: currentUser } = await supabase.auth.getUser()
  if (!currentUser?.user) {
    redirect("/auth/login")
  }

  // Get profile by username
  const { data: profile } = await supabase.from("profiles").select("*").eq("username", username).single()

  if (!profile) {
    notFound()
  }

  const isOwnProfile = currentUser.user.id === profile.id

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />
            <ProfilePosts userId={profile.id} />
          </div>
        </main>
      </div>
    </div>
  )
}
