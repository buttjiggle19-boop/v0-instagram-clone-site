import { createClient } from "@/lib/supabase/server"
import { CreateReelForm } from "@/components/create-reel-form"
import { redirect } from "next/navigation"

export default async function CreateReelPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <CreateReelForm />
    </div>
  )
}
