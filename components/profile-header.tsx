"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Settings, UserPlus, UserMinus } from "lucide-react"
import Link from "next/link"

interface Profile {
  id: string
  username: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  website: string | null
  followers_count: number
  following_count: number
  posts_count: number
}

interface ProfileHeaderProps {
  profile: Profile
  isOwnProfile: boolean
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

export function ProfileHeader({ profile, isOwnProfile }: ProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(profile.followers_count)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    getCurrentUser()
    if (!isOwnProfile) {
      checkFollowStatus()
    }
  }, [isOwnProfile])

  const getCurrentUser = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const checkFollowStatus = async () => {
    if (!currentUser) return

    const supabase = createClient()
    const { data } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", currentUser.id)
      .eq("following_id", profile.id)
      .single()

    setIsFollowing(!!data)
  }

  const toggleFollow = async () => {
    if (!currentUser) return

    const supabase = createClient()

    if (isFollowing) {
      // Unfollow
      await supabase.from("follows").delete().eq("follower_id", currentUser.id).eq("following_id", profile.id)

      setIsFollowing(false)
      setFollowersCount((prev) => prev - 1)
    } else {
      // Follow
      await supabase.from("follows").insert({
        follower_id: currentUser.id,
        following_id: profile.id,
      })

      setIsFollowing(true)
      setFollowersCount((prev) => prev + 1)
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 mb-12">
      {/* Avatar */}
      <div className="flex justify-center md:justify-start">
        <Avatar className="w-32 h-32 md:w-40 md:h-40">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="text-2xl">{profile.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>

      {/* Profile Info */}
      <div className="flex-1 text-center md:text-left">
        {/* Username and Actions */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-light">{profile.username}</h1>

          {isOwnProfile ? (
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/profile/edit">Edit profile</Link>
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={toggleFollow}
              variant={isFollowing ? "outline" : "default"}
              className="flex items-center gap-2"
            >
              {isFollowing ? (
                <>
                  <UserMinus className="w-4 h-4" />
                  Unfollow
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Follow
                </>
              )}
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="flex justify-center md:justify-start gap-8 mb-6">
          <div className="text-center">
            <div className="font-semibold">{formatNumber(profile.posts_count)}</div>
            <div className="text-sm text-muted-foreground">posts</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{formatNumber(followersCount)}</div>
            <div className="text-sm text-muted-foreground">followers</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{formatNumber(profile.following_count)}</div>
            <div className="text-sm text-muted-foreground">following</div>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1">
          {profile.full_name && <div className="font-semibold">{profile.full_name}</div>}
          {profile.bio && <div className="text-sm whitespace-pre-wrap">{profile.bio}</div>}
          {profile.website && (
            <div className="text-sm">
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {profile.website}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
