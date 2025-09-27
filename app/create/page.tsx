import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CreatePostForm } from "@/components/create-post-form"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ImageIcon, Video } from "lucide-react"
import Link from "next/link"

export default async function CreatePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64">
          <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-8">Create New Content</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Create Post</h3>
                  <p className="text-muted-foreground mb-4">Share photos with your followers</p>
                  <div className="space-y-4">
                    <CreatePostForm />
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <Link href="/reels/create">
                  <CardContent className="p-6 text-center h-full flex flex-col justify-center">
                    <Video className="w-12 h-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-lg font-semibold mb-2">Create Reel</h3>
                    <p className="text-muted-foreground mb-4">Share short videos and go viral</p>
                    <Button className="w-full">Create Reel</Button>
                  </CardContent>
                </Link>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
