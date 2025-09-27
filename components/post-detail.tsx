"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

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

interface Comment {
  id: string
  content: string
  created_at: string
  profiles: {
    username: string
    avatar_url: string | null
  }
}

interface PostDetailProps {
  post: Post
}

export function PostDetail({ post }: PostDetailProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUser()
    fetchComments()
    checkIfLiked()
  }, [])

  const getCurrentUser = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const fetchComments = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("comments")
      .select(`
        id,
        content,
        created_at,
        profiles (
          username,
          avatar_url
        )
      `)
      .eq("post_id", post.id)
      .order("created_at", { ascending: true })

    if (!error && data) {
      setComments(data)
    }
    setLoading(false)
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
      await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", currentUser.id)

      setIsLiked(false)
      setLikesCount((prev) => prev - 1)
    } else {
      await supabase.from("likes").insert({
        post_id: post.id,
        user_id: currentUser.id,
      })

      setIsLiked(true)
      setLikesCount((prev) => prev + 1)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !currentUser) return

    const supabase = createClient()
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: post.id,
        user_id: currentUser.id,
        content: newComment.trim(),
      })
      .select(`
        id,
        content,
        created_at,
        profiles (
          username,
          avatar_url
        )
      `)
      .single()

    if (!error && data) {
      setComments((prev) => [...prev, data])
      setNewComment("")
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-card rounded-lg border border-border overflow-hidden md:flex">
        {/* Image */}
        <div className="md:flex-1 aspect-square md:aspect-auto">
          <img
            src={post.image_url || "/placeholder.svg"}
            alt={post.caption || "Post image"}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="md:w-96 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={post.profiles.avatar_url || undefined} />
                <AvatarFallback>{post.profiles.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Link href={`/profile/${post.profiles.username}`} className="font-semibold text-sm hover:underline">
                {post.profiles.username}
              </Link>
            </div>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>

          {/* Comments */}
          <div className="flex-1 overflow-y-auto max-h-96 p-4 space-y-4">
            {/* Caption */}
            {post.caption && (
              <div className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={post.profiles.avatar_url || undefined} />
                  <AvatarFallback>{post.profiles.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-sm">
                    <Link href={`/profile/${post.profiles.username}`} className="font-semibold mr-2 hover:underline">
                      {post.profiles.username}
                    </Link>
                    <span>{post.caption}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )}

            {/* Comments List */}
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                      <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.profiles.avatar_url || undefined} />
                    <AvatarFallback>{comment.profiles.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm">
                      <Link
                        href={`/profile/${comment.profiles.username}`}
                        className="font-semibold mr-2 hover:underline"
                      >
                        {comment.profiles.username}
                      </Link>
                      <span>{comment.content}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="p-0 h-auto" onClick={toggleLike}>
                  <Heart className={`w-6 h-6 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                <Button variant="ghost" size="sm" className="p-0 h-auto">
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
            {likesCount > 0 && (
              <p className="font-semibold text-sm mb-2">
                {likesCount} {likesCount === 1 ? "like" : "likes"}
              </p>
            )}

            {/* Add Comment */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 border-0 p-0 focus-visible:ring-0"
              />
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                disabled={!newComment.trim()}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Post
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
