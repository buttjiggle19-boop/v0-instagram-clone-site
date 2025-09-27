"use client"

import { useState, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share, Play, Volume2, VolumeX } from "lucide-react"

interface ReelCardProps {
  reel: {
    id: string
    user_id: string
    video_url: string
    thumbnail_url: string | null
    caption: string | null
    views_count: number
    likes_count: number
    comments_count: number
    shares_count: number
    profiles: {
      username: string
      full_name: string | null
      avatar_url: string | null
      followers_count: number
    }
  }
  isActive: boolean
  onNext: () => void
  onPrev: () => void
}

export function ReelCard({ reel, isActive, onNext, onPrev }: ReelCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(reel.likes_count)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play()
      setIsPlaying(true)
    } else if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [isActive])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleLike = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      if (isLiked) {
        await supabase.from("reel_likes").delete().eq("user_id", user.id).eq("reel_id", reel.id)
        setLikesCount((prev) => prev - 1)
      } else {
        await supabase.from("reel_likes").insert({ user_id: user.id, reel_id: reel.id })
        setLikesCount((prev) => prev + 1)
      }
      setIsLiked(!isLiked)
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {/* Video */}
      <video
        ref={videoRef}
        src={reel.video_url}
        className="w-full h-full object-cover"
        loop
        muted={isMuted}
        playsInline
        onClick={togglePlay}
      />

      {/* Play/Pause overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="w-20 h-20 rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={togglePlay}
          >
            <Play className="w-10 h-10" />
          </Button>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleMute}>
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </Button>
      </div>

      {/* User info and actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-end justify-between">
          {/* User info */}
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="w-10 h-10">
                <AvatarImage src={reel.profiles.avatar_url || ""} />
                <AvatarFallback>{reel.profiles.username[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-semibold">@{reel.profiles.username}</p>
                <p className="text-gray-300 text-sm">{formatCount(reel.profiles.followers_count)} followers</p>
              </div>
            </div>
            {reel.caption && <p className="text-white text-sm mb-2">{reel.caption}</p>}
            <p className="text-gray-400 text-xs">{formatCount(reel.views_count)} views</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <Button
                variant="ghost"
                size="icon"
                className={`w-12 h-12 rounded-full ${isLiked ? "text-red-500" : "text-white"} hover:bg-white/20`}
                onClick={handleLike}
              >
                <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
              </Button>
              <p className="text-white text-xs mt-1">{formatCount(likesCount)}</p>
            </div>

            <div className="text-center">
              <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full text-white hover:bg-white/20">
                <MessageCircle className="w-6 h-6" />
              </Button>
              <p className="text-white text-xs mt-1">{formatCount(reel.comments_count)}</p>
            </div>

            <div className="text-center">
              <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full text-white hover:bg-white/20">
                <Share className="w-6 h-6" />
              </Button>
              <p className="text-white text-xs mt-1">{formatCount(reel.shares_count)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute inset-y-0 left-0 w-1/3" onClick={onPrev} />
      <div className="absolute inset-y-0 right-0 w-1/3" onClick={onNext} />
    </div>
  )
}
