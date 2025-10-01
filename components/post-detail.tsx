"use client"

import React, { useEffect, useState } from "react"
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
  views_count?: number
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

export const PostDetail: React.FC<PostDetailProps> = ({ post }) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState<number>(post.likes_count ?? 0)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loadingComments, setLoadingComments] = useState(true)
  const [likeLoading, setLikeLoading] = useState(false)

  useEffect(() => {
    // load user and comments on mount
    const init = async () => {
      await getCurrentUser()
      await fetchComments()
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // when currentUser becomes available, check if liked
  useEffect(() => {
    if (currentUser) {
      checkIfLiked()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser])

  const getCurrentUser = async () => {
    const supabase = createClient()
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setCurrentUser(user)
    } catch (err) {
      // silent fail — user might be null
      setCurrentUser(null)
    }
  }

  const fetchComments = async () => {
    setLoadingComments(true)
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
    } else {
      setComments([])
    }
    setLoadingComments(false)
  }

  const checkIfLiked = async () => {
    if (!currentUser) {
      setIsLiked(false)
      return
    }

    const supabase = createClient()
    const { data, error } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", post.id)
      .eq("user_id", currentUser.id)
      .limit(1)
      .maybeSingle()

    if (!error) {
      setIsLiked(!!data)
    }
  }

  const toggleLike = async () => {
    if (!currentUser || likeLoading) return
    setLikeLoading(true)
    const supabase = createClient()

    if (isLiked) {
      // optimistic update
      setIsLiked(false)
      setLikesCount((c) => Math.max(0, c - 1))

      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", currentUser.id)

      if (error) {
        // revert on failure
        setIsLiked(true)
        setLikesCount((c) => c + 1)
      }
    } else {
      // optimistic update
      setIsLiked(true)
      setLikesCount((c) => c + 1)

      const { error } = await supabase.from("likes").insert({
        post_id: post.id,
        user_id: currentUser.id,
      })

      if (error) {
        // revert on failure
        setIsLiked(false)
        setLikesCount((c) => Math.max(0, c - 1))
      }
    }

    setLikeLoading(false)
  }

  const handleAddComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!newComment.trim() || !currentUser) return

    const supabase = createClient()

    // optimistic local add with a temporary id
    const tempComment: Comment = {
      id: `temp-${Date.now()}`,
      content: newComment.trim(),
      created_at: new Date().toISOString(),
      profiles: {
        username: currentUser.user_metadata?.username ?? currentUser.email ?? "You",
        avatar_url: currentUser.user_metadata?.avatar_url ?? null,
      },
    }
    setComments((prev) => [...prev, tempComment])
    setNewComment("")

    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: post.id,
        user_id: currentUser.id,
        content: tempComment.content,
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
      // replace temp comment with saved one
      setComments((prev) => prev.map((c) => (c.id.startsWith("temp-") ? data : c)))
    } else {
      // if error, remove the temp comment
      setComments((prev) => prev.filter((c) => !c.id.startsWith("temp-")))
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
            <Button variant="ghost" size="icon" aria-label="more">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>

          {/* Comments / Caption */}
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
            {loadingComments ? (
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
                      <Link href={`/profile/${comment.profiles.username}`} className="font-semibold mr-2 hover:underline">
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

          {/* Actions / Likes / Views / Add comment */}
          <div className="border-t border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto"
                  onClick={toggleLike}
                  aria-pressed={isLiked}
                  aria-label={isLiked ? "Unlike" : "Like"}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? "text-red-500" : ""}`} />
                </Button>

                <Button variant="ghost" size="sm" className="p-0 h-auto" aria-label="comment">
                  <MessageCircle className="w-5 h-5" />
                </Button>

                <Button variant="ghost" size="sm" className="p-0 h-auto" aria-label="share">
                  <Send className="w-5 h-5" />
                </Button>
              </div>

              <Button variant="ghost" size="sm" className="p-0 h-auto" aria-label="save">
                <Bookmark className="w-5 h-5" />
              </Button>
            </div>

            {/* Likes */}
            {likesCount > 0 && (
              <p className="text-sm font-semibold">
                {likesCount} {likesCount === 1 ? "like" : "likes"}
              </p>
            )}

            {/* Views */}
            {post.views_count !== undefined && (
              <p className="text-xs text-muted-foreground">
                {post.views_count.toLocaleString()} views
              </p>
            )}
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="border-t border-border flex items-center p-3 gap-2">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={!currentUser || newComment.trim() === ""}>
              Post
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
