"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus } from "lucide-react"
import Link from "next/link"

interface Story {
  id: string
  user_id: string
  image_url: string
  profiles: {
    username: string
    avatar_url: string | null
  }
}

export function StoriesBar() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    getCurrentUser()
    fetchStories()
  }, [])

  const getCurrentUser = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const fetchStories = async () => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("stories")
      .select(`
        id,
        user_id,
        image_url,
        profiles (
          username,
          avatar_url
        )
      `)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })

    if (!error && data) {
      // Group stories by user, showing only the latest story per user
      const userStories = new Map()
      data.forEach((story) => {
        if (!userStories.has(story.user_id)) {
          userStories.set(story.user_id, story)
        }
      })
      setStories(Array.from(userStories.values()))
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex gap-4 p-4 overflow-x-auto">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-4 p-4 overflow-x-auto border-b border-border mb-6">
      {/* Add Story Button */}
      <Link href="/stories/create" className="flex-shrink-0 text-center">
        <div className="relative">
          <Avatar className="w-16 h-16 border-2 border-dashed border-muted-foreground">
            <AvatarFallback>
              <Plus className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>
        </div>
        <p className="text-xs mt-1 text-muted-foreground">Your story</p>
      </Link>

      {/* Stories */}
      {stories.map((story) => (
        <Link key={story.id} href={`/stories/${story.id}`} className="flex-shrink-0 text-center cursor-pointer">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 p-0.5">
              <Avatar className="w-full h-full border-2 border-background">
                <AvatarImage src={story.profiles.avatar_url || undefined} />
                <AvatarFallback>{story.profiles.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
          </div>
          <p className="text-xs mt-1 truncate w-16">{story.profiles.username}</p>
        </Link>
      ))}
    </div>
  )
}
