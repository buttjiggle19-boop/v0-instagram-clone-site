import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { StoryViewer } from "@/components/story-viewer"

interface StoryPageProps {
  params: Promise<{ id: string }>
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: currentUser } = await supabase.auth.getUser()
  if (!currentUser?.user) {
    redirect("/auth/login")
  }

  // Get story with profile data
  const { data: story } = await supabase
    .from("stories")
    .select(`
      id,
      user_id,
      image_url,
      caption,
      created_at,
      expires_at,
      profiles (
        username,
        avatar_url
      )
    `)
    .eq("id", id)
    .gt("expires_at", new Date().toISOString())
    .single()

  if (!story) {
    notFound()
  }

  // Record story view
  await supabase.from("story_views").upsert(
    {
      story_id: story.id,
      user_id: currentUser.user.id,
    },
    {
      onConflict: "story_id,user_id",
    },
  )

  return <StoryViewer story={story} />
}
