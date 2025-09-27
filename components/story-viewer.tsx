"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Story {
  id: string
  user_id: string
  image_url: string
  caption: string | null
  created_at: string
  expires_at: string
  profiles: {
    username: string
    avatar_url: string | null
  }
}

interface StoryViewerProps {
  story: Story
}

export function StoryViewer({ story }: StoryViewerProps) {
  const [progress, setProgress] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const duration = 5000 // 5 seconds
    const interval = 50 // Update every 50ms
    const increment = (interval / duration) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          router.push("/")
          return 100
        }
        return prev + increment
      })
    }, interval)

    return () => clearInterval(timer)
  }, [router])

  const handleClose = () => {
    router.push("/")
  }

  const handlePrevious = () => {
    // In a full implementation, this would navigate to the previous story
    router.push("/")
  }

  const handleNext = () => {
    // In a full implementation, this would navigate to the next story
    router.push("/")
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Progress Bar */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="w-full bg-white/30 rounded-full h-1">
          <div
            className="bg-white h-1 rounded-full transition-all duration-50 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Header */}
      <div className="absolute top-8 left-4 right-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8 border-2 border-white">
            <AvatarImage src={story.profiles.avatar_url || undefined} />
            <AvatarFallback className="text-xs">{story.profiles.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white font-semibold text-sm">{story.profiles.username}</p>
            <p className="text-white/80 text-xs">
              {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={handleClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Navigation */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
        onClick={handlePrevious}
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
        onClick={handleNext}
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Story Content */}
      <div className="relative max-w-sm w-full h-full max-h-[80vh] mx-4">
        <img
          src={story.image_url || "/placeholder.svg"}
          alt="Story"
          className="w-full h-full object-cover rounded-lg"
        />

        {/* Caption */}
        {story.caption && (
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-white text-sm bg-black/50 p-3 rounded-lg">{story.caption}</p>
          </div>
        )}
      </div>

      {/* Click areas for navigation */}
      <div className="absolute left-0 top-0 w-1/3 h-full cursor-pointer z-5" onClick={handlePrevious} />
      <div className="absolute right-0 top-0 w-1/3 h-full cursor-pointer z-5" onClick={handleNext} />
    </div>
  )
}
