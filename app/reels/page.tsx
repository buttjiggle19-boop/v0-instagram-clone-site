import { createClient } from "@/lib/supabase/server"
import { ReelsFeed } from "@/components/reels-feed"
import { redirect } from "next/navigation"

export default async function ReelsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-black">
      <ReelsFeed />
    </div>
  )
}
