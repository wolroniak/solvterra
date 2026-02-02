import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

interface NotifyRequest {
  challenge_id: string
  category: string
  payload: {
    title?: string
    title_en?: string
    organization_id?: string
    xp_reward?: number
  }
}

serve(async (req) => {
  try {
    const { challenge_id, payload }: NotifyRequest = await req.json()

    // Get all users who want new challenge notifications
    const { data: users } = await supabase
      .from('notification_preferences')
      .select('user_id')
      .eq('new_challenges', true)

    if (!users?.length) {
      return new Response(JSON.stringify({ skipped: 'no_users_opted_in' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get push tokens for these users
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('expo_push_token')
      .in('user_id', users.map(u => u.user_id))
      .eq('is_active', true)

    if (!tokens?.length) {
      return new Response(JSON.stringify({ skipped: 'no_tokens' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Build notification content
    const title = '🌱 New Challenge Available!'
    const body = payload.title || 'Check out the latest micro-volunteering opportunity'

    // Build Expo push messages
    const messages = tokens.map(t => ({
      to: t.expo_push_token,
      sound: 'default' as const,
      title,
      body,
      data: { type: 'new_challenge', challenge_id, ...payload },
    }))

    // Expo recommends batching in chunks of 100
    const BATCH_SIZE = 100
    const results = []

    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      const batch = messages.slice(i, i + BATCH_SIZE)
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(batch),
      })
      results.push(await response.json())
    }

    return new Response(JSON.stringify({ sent: messages.length, batches: results.length, results }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
