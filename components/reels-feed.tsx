"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { ReelCard } from "./reel-card"

interface Reel {
  id: string
  user_id: string
  video_url: string
  thumbnail_url: string | null
  caption: string | null
  views_count: number
  likes_count: number
  comments_count: number
  shares_count: number
  created_at: string
  profiles: {
    username: string
    full_name: string | null
    avatar_url: string | null
    followers_count: number
  }
}

export function ReelsFeed() {
  const [reels, setReels] = useState<Reel[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    fetchReels()
  }, [])

  const fetchReels = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("reels")
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url,
            followers_count
          )
        `)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error
      setReels(data || [])
    } catch (error) {
      console.error("Error fetching reels:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white">Loading reels...</div>
      </div>
    )
  }

  if (reels.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">No reels yet</h2>
          <p className="text-gray-400">Be the first to create a reel!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen overflow-hidden">
      {reels.map((reel, index) => (
        <div
          key={reel.id}
          className={`absolute inset-0 transition-transform duration-300 ${
            index === currentIndex ? "translate-y-0" : index < currentIndex ? "-translate-y-full" : "translate-y-full"
          }`}
        >
          <ReelCard
            reel={reel}
            isActive={index === currentIndex}
            onNext={() => setCurrentIndex((prev) => Math.min(prev + 1, reels.length - 1))}
            onPrev={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
          />
        </div>
      ))}
    </div>
  )
}
