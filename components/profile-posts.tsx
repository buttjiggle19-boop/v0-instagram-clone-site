"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Grid, Heart, MessageCircle, Eye } from "lucide-react"

interface Post {
  id: string
  image_url: string
  likes_count: number
  comments_count: number
  views_count: number // Added views_count
}

interface ProfilePostsProps {
  userId: string
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K"
  }
  return num.toString()
}

export function ProfilePosts({ userId }: ProfilePostsProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [userId])

  const fetchPosts = async () => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("posts")
      .select("id, image_url, likes_count, comments_count, views_count") // Added views_count to select
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setPosts(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-1 md:gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-square bg-muted animate-pulse rounded" />
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <Grid className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Posts Yet</h3>
        <p className="text-muted-foreground">When you share photos, they'll appear on your profile.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Posts Grid */}
      <div className="grid grid-cols-3 gap-1 md:gap-4">
        {posts.map((post) => (
          <div key={post.id} className="aspect-square relative group cursor-pointer overflow-hidden rounded">
            <img src={post.image_url || "/placeholder.svg"} alt="Post" className="w-full h-full object-cover" />

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex items-center gap-4 text-white text-sm md:text-base">
                <div className="flex items-center gap-1 md:gap-2">
                  <Heart className="w-4 h-4 md:w-6 md:h-6 fill-white" />
                  <span className="font-semibold">{formatNumber(post.likes_count)}</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <MessageCircle className="w-4 h-4 md:w-6 md:h-6 fill-white" />
                  <span className="font-semibold">{formatNumber(post.comments_count)}</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <Eye className="w-4 h-4 md:w-6 md:h-6 fill-white" />
                  <span className="font-semibold">{formatNumber(post.views_count || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
