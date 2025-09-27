import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// Bot comment templates for reels
const REEL_BOT_COMMENTS = [
  "This is fire! 🔥🔥🔥",
  "Can't stop watching! 🔄",
  "Viral vibes! 📈",
  "This hits different! 💯",
  "Obsessed! 😍",
  "Pure talent! ⭐",
  "So good! 🙌",
  "This is everything! ✨",
  "Amazing content! 👏",
  "Love this energy! ⚡",
  "Incredible! 🤩",
  "This is art! 🎨",
  "So creative! 💡",
  "Perfection! 💎",
  "Mind blown! 🤯",
  "This deserves to go viral! 🚀",
  "Can't get enough! 🔁",
  "So talented! 🌟",
  "This made my day! ☀️",
  "Absolutely stunning! 💫",
]

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Reel engagement API called")
    const { reelId, userId } = await request.json()

    if (!reelId || !userId) {
      console.log("[v0] Missing reelId or userId:", { reelId, userId })
      return NextResponse.json({ error: "Missing reelId or userId" }, { status: 400 })
    }

    const supabase = await createClient()
    console.log("[v0] Supabase client created for reels")

    // Get user's follower count to determine engagement level
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("followers_count")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.log("[v0] Profile error:", profileError)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!userProfile) {
      console.log("[v0] User profile not found")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const followerCount = userProfile.followers_count || 0
    console.log("[v0] User follower count for reel:", followerCount)

    let viewRate = 0.4 // 40% base view rate (increased)
    let likeRate = 0.2 // 20% base like rate (increased)
    let commentRate = 0.08 // 8% base comment rate (increased)
    let shareRate = 0.03 // 3% base share rate (increased)

    if (followerCount > 1000000) {
      // 1M+ followers
      viewRate = 0.8 // 80%
      likeRate = 0.4 // 40%
      commentRate = 0.15 // 15%
      shareRate = 0.08 // 8%
    } else if (followerCount > 500000) {
      // 500K+ followers
      viewRate = 0.7 // 70%
      likeRate = 0.35 // 35%
      commentRate = 0.12 // 12%
      shareRate = 0.06 // 6%
    } else if (followerCount > 100000) {
      // 100K+ followers
      viewRate = 0.6 // 60%
      likeRate = 0.25 // 25%
      commentRate = 0.1 // 10%
      shareRate = 0.04 // 4%
    }

    // Calculate numbers with randomization - ensure minimum engagement
    const numViews = Math.max(100, Math.floor(followerCount * viewRate * (0.8 + Math.random() * 0.4)))
    const numLikes = Math.max(20, Math.floor(followerCount * likeRate * (0.6 + Math.random() * 0.8)))
    const numComments = Math.max(5, Math.floor(followerCount * commentRate * (0.4 + Math.random() * 1.2)))
    const numShares = Math.max(2, Math.floor(followerCount * shareRate * (0.3 + Math.random() * 1.4)))

    console.log("[v0] Calculated reel engagement:", { numViews, numLikes, numComments, numShares })

    // Get all bot users
    const { data: bots, error: botsError } = await supabase.from("profiles").select("id").eq("is_bot", true)

    if (botsError) {
      console.log("[v0] Bots query error:", botsError)
      return NextResponse.json({ error: "Failed to get bots" }, { status: 500 })
    }

    if (!bots || bots.length === 0) {
      console.log("[v0] No bots available for reels")
      return NextResponse.json({ error: "No bots available" }, { status: 500 })
    }

    console.log("[v0] Found bots for reels:", bots.length)

    // Update view count immediately
    const { error: viewUpdateError } = await supabase.from("reels").update({ views_count: numViews }).eq("id", reelId)

    if (viewUpdateError) {
      console.log("[v0] View count update error:", viewUpdateError)
    } else {
      console.log("[v0] Updated view count:", numViews)
    }

    // Generate bot likes
    const likesToInsert = []
    const usedBotIds = new Set()

    for (let i = 0; i < Math.min(numLikes, bots.length); i++) {
      let randomBot
      do {
        randomBot = bots[Math.floor(Math.random() * bots.length)]
      } while (usedBotIds.has(randomBot.id) && usedBotIds.size < bots.length)

      if (!usedBotIds.has(randomBot.id)) {
        usedBotIds.add(randomBot.id)
        likesToInsert.push({
          user_id: randomBot.id,
          reel_id: reelId,
        })
      }
    }

    // Insert bot likes
    if (likesToInsert.length > 0) {
      const { error: likesError } = await supabase.from("reel_likes").insert(likesToInsert)
      if (likesError) {
        console.log("[v0] Reel likes insert error:", likesError)
      } else {
        console.log("[v0] Inserted reel likes:", likesToInsert.length)
      }
    }

    // Generate bot comments
    const commentsToInsert = []
    const commentBotIds = new Set()

    for (let i = 0; i < Math.min(numComments, bots.length); i++) {
      let randomBot
      do {
        randomBot = bots[Math.floor(Math.random() * bots.length)]
      } while (commentBotIds.has(randomBot.id) && commentBotIds.size < bots.length)

      if (!commentBotIds.has(randomBot.id)) {
        commentBotIds.add(randomBot.id)
        const randomComment = REEL_BOT_COMMENTS[Math.floor(Math.random() * REEL_BOT_COMMENTS.length)]
        commentsToInsert.push({
          user_id: randomBot.id,
          reel_id: reelId,
          content: randomComment,
        })
      }
    }

    // Insert bot comments
    let insertedComments = []
    if (commentsToInsert.length > 0) {
      const { data: comments, error: commentsError } = await supabase
        .from("reel_comments")
        .insert(commentsToInsert)
        .select("id")

      if (commentsError) {
        console.log("[v0] Reel comments insert error:", commentsError)
      } else {
        console.log("[v0] Inserted reel comments:", commentsToInsert.length)
        insertedComments = comments || []
      }
    }

    let totalCommentLikes = 0
    for (const comment of insertedComments) {
      // Each comment gets 10-100 likes from random bots
      const commentLikes = Math.floor(Math.random() * 91) + 10
      const commentLikesToInsert = []
      const commentLikeBotIds = new Set()

      for (let i = 0; i < Math.min(commentLikes, bots.length); i++) {
        let randomBot
        do {
          randomBot = bots[Math.floor(Math.random() * bots.length)]
        } while (commentLikeBotIds.has(randomBot.id) && commentLikeBotIds.size < bots.length)

        if (!commentLikeBotIds.has(randomBot.id)) {
          commentLikeBotIds.add(randomBot.id)
          commentLikesToInsert.push({
            user_id: randomBot.id,
            comment_id: comment.id,
          })
        }
      }

      if (commentLikesToInsert.length > 0) {
        const { error: commentLikesError } = await supabase.from("reel_comment_likes").insert(commentLikesToInsert)

        if (commentLikesError) {
          console.log("[v0] Reel comment likes insert error:", commentLikesError)
        } else {
          totalCommentLikes += commentLikesToInsert.length
        }
      }
    }

    console.log("[v0] Inserted reel comment likes:", totalCommentLikes)

    // Generate bot shares
    const sharesToInsert = []
    const shareBotIds = new Set()

    for (let i = 0; i < Math.min(numShares, bots.length); i++) {
      let randomBot
      do {
        randomBot = bots[Math.floor(Math.random() * bots.length)]
      } while (shareBotIds.has(randomBot.id) && shareBotIds.size < bots.length)

      if (!shareBotIds.has(randomBot.id)) {
        shareBotIds.add(randomBot.id)
        sharesToInsert.push({
          user_id: randomBot.id,
          reel_id: reelId,
        })
      }
    }

    // Insert bot shares
    if (sharesToInsert.length > 0) {
      const { error: sharesError } = await supabase.from("reel_shares").insert(sharesToInsert)
      if (sharesError) {
        console.log("[v0] Reel shares insert error:", sharesError)
      } else {
        console.log("[v0] Inserted reel shares:", sharesToInsert.length)
      }
    }

    console.log("[v0] Reel engagement completed successfully")
    return NextResponse.json({
      success: true,
      views: numViews,
      likes: likesToInsert.length,
      comments: commentsToInsert.length,
      shares: sharesToInsert.length,
      commentLikes: totalCommentLikes,
    })
  } catch (error) {
    console.error("[v0] Reel engagement error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
