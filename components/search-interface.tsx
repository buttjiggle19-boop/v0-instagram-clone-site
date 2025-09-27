"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search } from "lucide-react"
import Link from "next/link"

interface SearchResult {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  followers_count: number
}

export function SearchInterface() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.trim()) {
      searchUsers()
    } else {
      setResults([])
    }
  }, [query])

  const searchUsers = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, followers_count")
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(20)

    if (!error && data) {
      setResults(data)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-12"
        />
      </div>

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
                <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-2">
          {results.map((user) => (
            <Link
              key={user.id}
              href={`/profile/${user.username}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <Avatar className="w-12 h-12">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{user.username}</p>
                {user.full_name && <p className="text-sm text-muted-foreground">{user.full_name}</p>}
                <p className="text-xs text-muted-foreground">{user.followers_count} followers</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No users found for "{query}"</p>
        </div>
      )}
    </div>
  )
}
