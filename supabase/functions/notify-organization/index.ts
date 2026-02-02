import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

interface NotifyRequest {
  type: string
  organization_id: string
  payload: Record<string, unknown>
}

serve(async (req) => {
  try {
    const { type, organization_id, payload }: NotifyRequest = await req.json()

    // Check org preferences
    const { data: prefs } = await supabase
      .from('ngo_notification_preferences')
      .select('*')
      .eq('organization_id', organization_id)
      .single()

    // Map notification type to preference key
    const prefKeyMap: Record<string, string> = {
      new_participant: 'new_participant',
      proof_submitted: 'proof_submitted',
      verification_status_changed: 'verification_update',
    }

    const prefKey = prefKeyMap[type]
    if (prefs && prefKey && prefs[prefKey] === false) {
      return new Response(JSON.stringify({ skipped: 'org_preference' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get all admin user_ids for this org
    const { data: admins } = await supabase
      .from('ngo_admins')
      .select('user_id')
      .eq('organization_id', organization_id)

    if (!admins?.length) {
      return new Response(JSON.stringify({ skipped: 'no_admins' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get push tokens for all admins
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('expo_push_token')
      .in('auth_user_id', admins.map(a => a.user_id))
      .eq('is_active', true)

    if (!tokens?.length) {
      return new Response(JSON.stringify({ skipped: 'no_tokens' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Build notification content based on type
    const contentMap: Record<string, { title: string; body: string }> = {
      new_participant: {
        title: '👋 New Participant',
        body: `${payload.user_display_name || 'Someone'} accepted your challenge!`
      },
      proof_submitted: {
        title: '📸 Proof Submitted',
        body: `${payload.user_display_name || 'A participant'} submitted proof for review`
      },
      verification_status_changed: {
        title: payload.new_status === 'verified' ? '✅ Verified!' : '⚠️ Verification Update',
        body: payload.new_status === 'verified'
          ? 'Your organization is now verified!'
          : `Verification status changed to ${payload.new_status}`
      },
    }

    const content = contentMap[type] || {
      title: 'SolvTerra',
      body: 'You have a new notification'
    }

    // Build Expo push messages
    const messages = tokens.map(t => ({
      to: t.expo_push_token,
      sound: 'default' as const,
      title: content.title,
      body: content.body,
      data: { type, organization_id, ...payload },
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
