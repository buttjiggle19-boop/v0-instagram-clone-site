"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Heart } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Comment {
  id: string
  content: string
  likes_count: number
  created_at: string
  profiles: {
    username: string
    avatar_url: string | null
    is_bot: boolean
  }
}

interface CommentsModalProps {
  postId: string
  onClose: () => void
}

export function CommentsModal({ postId, onClose }: CommentsModalProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())

  useEffect(() => {
    getCurrentUser()
    fetchComments()
  }, [postId])

  const getCurrentUser = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const fetchComments = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("comments")
      .select(`
        id,
        content,
        likes_count,
        created_at,
        profiles (
          username,
          avatar_url,
          is_bot
        )
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true })

    if (data) {
      setComments(data)

      // Check which comments are liked by current user
      if (currentUser) {
        const { data: userLikes } = await supabase
          .from("comment_likes")
          .select("comment_id")
          .eq("user_id", currentUser.id)
          .in(
            "comment_id",
            data.map((c) => c.id),
          )

        if (userLikes) {
          setLikedComments(new Set(userLikes.map((like) => like.comment_id)))
        }
      }
    }
  }

  const addComment = async () => {
    if (!newComment.trim() || !currentUser) return

    const supabase = createClient()
    const { data } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: currentUser.id,
        content: newComment.trim(),
      })
      .select(`
        id,
        content,
        likes_count,
        created_at,
        profiles (
          username,
          avatar_url,
          is_bot
        )
      `)
      .single()

    if (data) {
      setComments((prev) => [...prev, data])
      setNewComment("")

      // Trigger bot engagement for comment likes
      setTimeout(() => {
        triggerCommentBotLikes(data.id)
      }, 1000)
    }
  }

  const triggerCommentBotLikes = async (commentId: string) => {
    try {
      const supabase = createClient()

      // Get random number of bot likes (1-5)
      const numLikes = Math.floor(Math.random() * 5) + 1

      // Get random bots
      const { data: bots } = await supabase.from("profiles").select("id").eq("is_bot", true).limit(numLikes)

      if (bots && bots.length > 0) {
        const likesToInsert = bots.map((bot) => ({
          user_id: bot.id,
          comment_id: commentId,
        }))

        await supabase.from("comment_likes").insert(likesToInsert)

        // Refresh comments to show updated like counts
        fetchComments()
      }
    } catch (error) {
      console.error("Failed to add bot likes to comment:", error)
    }
  }

  const toggleCommentLike = async (commentId: string) => {
    if (!currentUser) return

    const supabase = createClient()
    const isLiked = likedComments.has(commentId)

    if (isLiked) {
      await supabase.from("comment_likes").delete().eq("comment_id", commentId).eq("user_id", currentUser.id)

      setLikedComments((prev) => {
        const newSet = new Set(prev)
        newSet.delete(commentId)
        return newSet
      })
    } else {
      await supabase.from("comment_likes").insert({
        comment_id: commentId,
        user_id: currentUser.id,
      })

      setLikedComments((prev) => new Set([...prev, commentId]))
    }

    // Refresh comments to show updated counts
    fetchComments()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={comment.profiles.avatar_url || undefined} />
                <AvatarFallback>{comment.profiles.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{comment.profiles.username}</span>
                      {comment.profiles.is_bot && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">BOT</span>
                      )}
                    </div>
                    <p className="text-sm mt-1">{comment.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                      {comment.likes_count > 0 && <span>{comment.likes_count} likes</span>}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto"
                    onClick={() => toggleCommentLike(comment.id)}
                  >
                    <Heart className={`w-4 h-4 ${likedComments.has(comment.id) ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {currentUser && (
          <div className="flex gap-2 pt-4 border-t">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addComment()}
              className="flex-1"
            />
            <Button onClick={addComment} disabled={!newComment.trim()}>
              Post
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
