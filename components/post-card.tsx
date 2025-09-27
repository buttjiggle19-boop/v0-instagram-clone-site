"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Send, Bookmark } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { CommentsModal } from "@/components/comments-modal"

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

interface PostCardProps {
  post: Post
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

export function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showComments, setShowComments] = useState(false)

  useEffect(() => {
    getCurrentUser()
  }, [])

  useEffect(() => {
    if (currentUser) {
      checkIfLiked()
      trackPostView()
    }
  }, [currentUser])

  useEffect(() => {
    setLikesCount(post.likes_count)
  }, [post.likes_count])

  const getCurrentUser = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const checkIfLiked = async () => {
    if (!currentUser) return

    const supabase = createClient()
    const { data } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", post.id)
      .eq("user_id", currentUser.id)
      .single()

    setIsLiked(!!data)
  }

  const toggleLike = async () => {
    if (!currentUser) return

    const supabase = createClient()

    if (isLiked) {
      // Unlike
      await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", currentUser.id)

      setIsLiked(false)
      setLikesCount((prev) => prev - 1)
    } else {
      // Like
      await supabase.from("likes").insert({
        post_id: post.id,
        user_id: currentUser.id,
      })

      setIsLiked(true)
      setLikesCount((prev) => prev + 1)
    }
  }

  const trackPostView = async () => {
    if (!currentUser) return

    try {
      const supabase = createClient()

      // Insert view record (optional, for analytics)
      await supabase.from("post_views").insert({
        post_id: post.id,
        user_id: currentUser.id,
      })

      // Update view count
      await supabase.rpc("increment_views", { post_id: post.id })
    } catch (error) {
      // Silently fail - views are not critical
      console.log("View tracking failed:", error)
    }
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.profiles.avatar_url || undefined} />
            <AvatarFallback>{post.profiles.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{post.profiles.username}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="aspect-square relative">
        <img
          src={post.image_url || "/placeholder.svg"}
          alt={post.caption || "Post image"}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="p-0 h-auto" onClick={toggleLike}>
              <Heart className={`w-6 h-6 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button variant="ghost" size="sm" className="p-0 h-auto" onClick={() => setShowComments(true)}>
              <MessageCircle className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              <Send className="w-6 h-6" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="p-0 h-auto">
            <Bookmark className="w-6 h-6" />
          </Button>
        </div>

        {/* Likes */}
        <p className="font-semibold text-sm mb-2">
          {formatNumber(likesCount)} {likesCount === 1 ? "like" : "likes"}
        </p>

        {/* Caption */}
        {post.caption && (
          <div className="text-sm mb-2">
            <span className="font-semibold mr-2">{post.profiles.username}</span>
            <span>{post.caption}</span>
          </div>
        )}

        {/* Comments */}
        {post.comments_count > 0 && (
          <button className="text-sm text-muted-foreground" onClick={() => setShowComments(true)}>
            View all {formatNumber(post.comments_count)} comments
          </button>
        )}
      </div>

      {/* Comments Modal */}
      {showComments && <CommentsModal postId={post.id} onClose={() => setShowComments(false)} />}
    </div>
  )
}
