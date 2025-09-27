import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// Bot comment templates
const BOT_COMMENTS = [
  "Amazing shot! 🔥",
  "Love this! ❤️",
  "So beautiful! ✨",
  "Incredible! 😍",
  "This is perfect! 👌",
  "Stunning! 📸",
  "Goals! 💯",
  "Obsessed with this! 😱",
  "Pure magic! ✨",
  "Can't stop staring! 👀",
  "This hits different! 🔥",
  "Absolutely gorgeous! 💕",
  "Living for this! 🙌",
  "So aesthetic! 🎨",
  "This is everything! ⭐",
  "Wow factor! 🤩",
  "Perfection! 💎",
  "Chef's kiss! 👨‍🍳💋",
  "This is art! 🖼️",
  "Breathtaking! 🌟",
]

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Bot engagement API called")
    const { postId, userId } = await request.json()

    if (!postId || !userId) {
      console.log("[v0] Missing postId or userId:", { postId, userId })
      return NextResponse.json({ error: "Missing postId or userId" }, { status: 400 })
    }

    const supabase = await createClient()
    console.log("[v0] Supabase client created")

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

    const followerCount = userProfile.followers_count || 1000 // Default to 1000 if no followers
    console.log("[v0] User follower count:", followerCount)

    let likeRate = 0.35 // 35% base rate (massively increased)
    let commentRate = 0.12 // 12% base rate (massively increased)

    if (followerCount > 100000) {
      // 100K+ followers get viral-level engagement
      likeRate = 0.55 // 55%
      commentRate = 0.18 // 18%
    } else if (followerCount > 50000) {
      // 50K+ followers
      likeRate = 0.45 // 45%
      commentRate = 0.15 // 15%
    } else if (followerCount > 10000) {
      // 10K+ followers
      likeRate = 0.4 // 40%
      commentRate = 0.13 // 13%
    }

    // Calculate number of bot likes and comments with minimum guarantees
    const numLikes = Math.max(25, Math.floor(followerCount * likeRate * (0.7 + Math.random() * 0.6)))
    const numComments = Math.max(8, Math.floor(followerCount * commentRate * (0.5 + Math.random() * 0.8)))

    const viewMultiplier = 3 + Math.random() * 5 // 3-8x
    const numViews = Math.max(100, Math.floor(numLikes * viewMultiplier))

    console.log("[v0] Calculated engagement:", { numLikes, numComments, numViews })

    // Get all bot users
    const { data: bots, error: botsError } = await supabase.from("profiles").select("id").eq("is_bot", true)

    if (botsError || !bots || bots.length === 0) {
      console.log("[v0] No bots available")
      return NextResponse.json({ error: "No bots available" }, { status: 500 })
    }

    console.log("[v0] Found bots:", bots.length)

    // Phase 1: Immediate engagement (60% of total)
    const immediateLikes = Math.floor(numLikes * 0.6)
    const immediateComments = Math.floor(numComments * 0.6)

    // Generate immediate bot likes
    const likesToInsert = []
    const usedBotIds = new Set()

    for (let i = 0; i < Math.min(immediateLikes, bots.length); i++) {
      let randomBot
      do {
        randomBot = bots[Math.floor(Math.random() * bots.length)]
      } while (usedBotIds.has(randomBot.id) && usedBotIds.size < bots.length)

      if (!usedBotIds.has(randomBot.id)) {
        usedBotIds.add(randomBot.id)
        likesToInsert.push({
          user_id: randomBot.id,
          post_id: postId,
        })
      }
    }

    // Insert immediate likes
    if (likesToInsert.length > 0) {
      const { error: likesError } = await supabase.from("likes").insert(likesToInsert)
      if (likesError) {
        console.log("[v0] Immediate likes insert error:", likesError)
      } else {
        console.log(`[v0] Inserted immediate likes: ${likesToInsert.length}`)
      }
    }

    // Generate immediate bot comments
    const commentsToInsert = []
    const commentBotIds = new Set()

    for (let i = 0; i < Math.min(immediateComments, bots.length); i++) {
      let randomBot
      do {
        randomBot = bots[Math.floor(Math.random() * bots.length)]
      } while (commentBotIds.has(randomBot.id) && commentBotIds.size < bots.length)

      if (!commentBotIds.has(randomBot.id)) {
        commentBotIds.add(randomBot.id)
        const randomComment = BOT_COMMENTS[Math.floor(Math.random() * BOT_COMMENTS.length)]
        commentsToInsert.push({
          user_id: randomBot.id,
          post_id: postId,
          content: randomComment,
        })
      }
    }

    // Insert immediate comments
    if (commentsToInsert.length > 0) {
      const { data: insertedComments, error: commentsError } = await supabase
        .from("comments")
        .insert(commentsToInsert)
        .select("id")

      if (commentsError) {
        console.log("[v0] Immediate comments insert error:", commentsError)
      } else {
        console.log(`[v0] Inserted immediate comments: ${commentsToInsert.length}`)

        // Add likes to immediate comments
        if (insertedComments && insertedComments.length > 0) {
          const commentLikesToInsert = []

          for (const comment of insertedComments) {
            const commentLikeCount = Math.floor(Math.random() * 10) + 3
            const commentLikeBots = new Set()

            for (let j = 0; j < Math.min(commentLikeCount, bots.length); j++) {
              let randomBot
              do {
                randomBot = bots[Math.floor(Math.random() * bots.length)]
              } while (commentLikeBots.has(randomBot.id) && commentLikeBots.size < bots.length)

              if (!commentLikeBots.has(randomBot.id)) {
                commentLikeBots.add(randomBot.id)
                commentLikesToInsert.push({
                  user_id: randomBot.id,
                  comment_id: comment.id,
                })
              }
            }
          }

          if (commentLikesToInsert.length > 0) {
            await supabase.from("comment_likes").insert(commentLikesToInsert)
          }
        }
      }
    }

    // Update view count immediately
    await supabase.from("posts").update({ views_count: numViews }).eq("id", postId)

    const remainingPhases = [
      { delay: 2000, likesPercent: 0.25, commentsPercent: 0.25 },
      { delay: 5000, likesPercent: 0.15, commentsPercent: 0.15 },
    ]

    for (const phase of remainingPhases) {
      setTimeout(async () => {
        const phaseLikes = Math.floor(numLikes * phase.likesPercent)
        const phaseComments = Math.floor(numComments * phase.commentsPercent)

        // Generate bot likes for this phase
        const likesToInsert = []
        const usedBotIds = new Set()

        for (let i = 0; i < Math.min(phaseLikes, bots.length); i++) {
          let randomBot
          do {
            randomBot = bots[Math.floor(Math.random() * bots.length)]
          } while (usedBotIds.has(randomBot.id) && usedBotIds.size < bots.length)

          if (!usedBotIds.has(randomBot.id)) {
            usedBotIds.add(randomBot.id)
            likesToInsert.push({
              user_id: randomBot.id,
              post_id: postId,
            })
          }
        }

        // Insert bot likes
        if (likesToInsert.length > 0) {
          const { error: likesError } = await supabase.from("likes").insert(likesToInsert)
          if (likesError) {
            console.log("[v0] Phase likes insert error:", likesError)
          } else {
            console.log(`[v0] Phase inserted likes: ${likesToInsert.length}`)
          }
        }

        // Generate bot comments for this phase
        const commentsToInsert = []
        const commentBotIds = new Set()

        for (let i = 0; i < Math.min(phaseComments, bots.length); i++) {
          let randomBot
          do {
            randomBot = bots[Math.floor(Math.random() * bots.length)]
          } while (commentBotIds.has(randomBot.id) && commentBotIds.size < bots.length)

          if (!commentBotIds.has(randomBot.id)) {
            commentBotIds.add(randomBot.id)
            const randomComment = BOT_COMMENTS[Math.floor(Math.random() * BOT_COMMENTS.length)]
            commentsToInsert.push({
              user_id: randomBot.id,
              post_id: postId,
              content: randomComment,
            })
          }
        }

        // Insert bot comments
        if (commentsToInsert.length > 0) {
          const { data: insertedComments, error: commentsError } = await supabase
            .from("comments")
            .insert(commentsToInsert)
            .select("id")

          if (commentsError) {
            console.log("[v0] Phase comments insert error:", commentsError)
          } else {
            console.log(`[v0] Phase inserted comments: ${commentsToInsert.length}`)

            // Add likes to comments
            if (insertedComments && insertedComments.length > 0) {
              const commentLikesToInsert = []

              for (const comment of insertedComments) {
                const commentLikeCount = Math.floor(Math.random() * 10) + 3
                const commentLikeBots = new Set()

                for (let j = 0; j < Math.min(commentLikeCount, bots.length); j++) {
                  let randomBot
                  do {
                    randomBot = bots[Math.floor(Math.random() * bots.length)]
                  } while (commentLikeBots.has(randomBot.id) && commentLikeBots.size < bots.length)

                  if (!commentLikeBots.has(randomBot.id)) {
                    commentLikeBots.add(randomBot.id)
                    commentLikesToInsert.push({
                      user_id: randomBot.id,
                      comment_id: comment.id,
                    })
                  }
                }
              }

              if (commentLikesToInsert.length > 0) {
                const { error: commentLikesError } = await supabase.from("comment_likes").insert(commentLikesToInsert)

                if (commentLikesError) {
                  console.log("[v0] Comment likes insert error:", commentLikesError)
                } else {
                  console.log(`[v0] Phase inserted comment likes: ${commentLikesToInsert.length}`)
                }
              }
            }
          }
        }
      }, phase.delay)
    }

    console.log("[v0] Bot engagement completed successfully")
    return NextResponse.json({
      success: true,
      likes: immediateLikes,
      comments: immediateComments,
      views: numViews,
    })
  } catch (error) {
    console.error("[v0] Bot engagement error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
