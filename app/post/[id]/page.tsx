import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PostDetail } from "@/components/post-detail"
import { Sidebar } from "@/components/sidebar"

interface PostPageProps {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: currentUser } = await supabase.auth.getUser()
  if (!currentUser?.user) {
    redirect("/auth/login")
  }

  // Get post with profile data
  const { data: post } = await supabase
    .from("posts")
    .select(`
      id,
      user_id,
      caption,
      image_url,
      likes_count,
      comments_count,
      created_at,
      profiles (
        username,
        avatar_url
      )
    `)
    .eq("id", id)
    .single()

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <PostDetail post={post} />
          </div>
        </main>
      </div>
    </div>
  )
}
