import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

interface NotifyRequest {
  type: string
  user_id: string
  payload: Record<string, unknown>
}

const NOTIFICATION_CONTENT: Record<string, (payload: Record<string, unknown>) => { title: string; body: string }> = {
  submission_reviewed: (p) => ({
    title: p.status === 'approved' ? '🎉 Challenge Approved!' : '📝 Feedback Received',
    body: p.status === 'approved'
      ? `You earned ${p.xp_earned} XP!`
      : 'Check the feedback on your submission'
  }),
  xp_milestone: (p) => ({
    title: '⬆️ Level Up!',
    body: `You reached Level ${p.new_level}!`
  }),
  badge_earned: (p) => ({
    title: '🏆 New Badge!',
    body: `You earned the ${p.badge_id} badge!`
  }),
  community_comment: (p) => ({
    title: '💬 New Comment',
    body: String(p.comment_preview || 'Someone commented on your post')
  }),
  community_like: () => ({
    title: '❤️ Someone liked your post',
    body: 'Check out your community post'
  }),
}

serve(async (req) => {
  try {
    const { type, user_id, payload }: NotifyRequest = await req.json()

    // Check user preferences
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user_id)
      .single()

    // Map notification type to preference key
    const prefKeyMap: Record<string, string> = {
      submission_reviewed: 'submission_reviewed',
      xp_milestone: 'xp_milestones',
      badge_earned: 'badge_earned',
      community_comment: 'community_comments',
      community_like: 'community_likes',
    }

    const prefKey = prefKeyMap[type]
    if (prefs && prefKey && prefs[prefKey] === false) {
      return new Response(JSON.stringify({ skipped: 'user_preference' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get user's active push tokens
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('expo_push_token')
      .eq('user_id', user_id)
      .eq('is_active', true)

    if (!tokens?.length) {
      return new Response(JSON.stringify({ skipped: 'no_tokens' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Build notification content
    const contentFn = NOTIFICATION_CONTENT[type]
    const content = contentFn ? contentFn(payload) : {
      title: 'SolvTerra',
      body: 'You have a new notification'
    }

    // Build Expo push messages
    const messages = tokens.map(t => ({
      to: t.expo_push_token,
      sound: 'default' as const,
      title: content.title,
      body: content.body,
      data: { type, ...payload },
    }))

    // Send to Expo Push API
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(messages),
    })

    const result = await response.json()

    return new Response(JSON.stringify({ sent: messages.length, result }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
