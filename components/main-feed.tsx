"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { PostCard } from "@/components/post-card"

interface Post {
  id: string
  user_id: string
  caption: string | null
  image_url: string
  likes_count: number
  comments_count: number
  created_at: string
  profiles: {
    username: string
    avatar_url: string | null
  }
}

export function MainFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()

    const supabase = createClient()
    const channel = supabase
      .channel("posts-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, (payload) => {
        console.log("[v0] Post updated:", payload)
        // Refresh posts when any post changes
        fetchPosts()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "likes" }, (payload) => {
        console.log("[v0] Like updated:", payload)
        // Refresh posts when likes change
        fetchPosts()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchPosts = async () => {
    const supabase = createClient()

    const { data, error } = await supabase
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
      .order("created_at", { ascending: false })
      .limit(20)

    if (!error && data) {
      console.log(
        "[v0] Fetched posts with likes:",
        data.map((p) => ({ id: p.id, likes: p.likes_count })),
      )
      setPosts(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                <div className="h-4 bg-muted rounded w-24 animate-pulse" />
              </div>
            </div>
            <div className="aspect-square bg-muted animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No posts yet. Start following people to see their posts!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
