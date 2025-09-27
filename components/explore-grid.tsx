"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Heart, MessageCircle } from "lucide-react"
import Link from "next/link"

interface Post {
  id: string
  image_url: string
  likes_count: number
  comments_count: number
}

export function ExploreGrid() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExplorePosts()
  }, [])

  const fetchExplorePosts = async () => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("posts")
      .select("id, image_url, likes_count, comments_count")
      .order("likes_count", { ascending: false })
      .limit(30)

    if (!error && data) {
      setPosts(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-1 md:gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-square bg-muted animate-pulse rounded" />
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No posts to explore yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-4">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/post/${post.id}`}
          className="aspect-square relative group cursor-pointer overflow-hidden rounded"
        >
          <img src={post.image_url || "/placeholder.svg"} alt="Post" className="w-full h-full object-cover" />

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="flex items-center gap-6 text-white">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 fill-white" />
                <span className="font-semibold">{post.likes_count}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-6 h-6 fill-white" />
                <span className="font-semibold">{post.comments_count}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
