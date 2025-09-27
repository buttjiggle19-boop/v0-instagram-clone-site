"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, Search, Compass, Heart, PlusSquare, User, LogOut, Menu, X, Play } from "lucide-react"

interface UserProfile {
  username: string
  avatar_url: string | null
  followers_count: number
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

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, avatar_url, followers_count")
        .eq("id", user.id)
        .single()

      if (profile) {
        setUserProfile(profile)
      }
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const menuItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Search, label: "Search", href: "/search" },
    { icon: Compass, label: "Explore", href: "/explore" },
    { icon: Play, label: "Reels", href: "/reels" },
    { icon: Heart, label: "Notifications", href: "/notifications" },
    { icon: PlusSquare, label: "Create", href: "/create" },
    { icon: User, label: "Profile", href: "/profile" },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`
        fixed left-0 top-0 z-40 h-full w-64 bg-background border-r border-border
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              PicPopper
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="h-6 w-6" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {userProfile && (
            <div className="border-t border-border pt-4 mb-4">
              <Link
                href="/profile"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={userProfile.avatar_url || undefined} />
                  <AvatarFallback>{userProfile.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{userProfile.username}</p>
                  <p className="text-sm text-muted-foreground">{formatNumber(userProfile.followers_count)} followers</p>
                </div>
              </Link>
            </div>
          )}

          {/* Sign Out */}
          <Button variant="ghost" className="justify-start gap-4 px-3 py-3 h-auto" onClick={handleSignOut}>
            <LogOut className="h-6 w-6" />
            <span className="font-medium">Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
