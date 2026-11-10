'use server'

import { refresh } from 'next/cache'
import { handleRsvp, handleWish } from '@/lib/guest-actions'
import { createPublicSupabase } from '@/lib/supabase/public'
import type { FormState } from '@/lib/validation'

export async function submitRsvp(_prev: FormState, fd: FormData): Promise<FormState> {
  return handleRsvp(fd, (row) => createPublicSupabase().from('rsvps').insert(row))
}

export async function submitWish(_prev: FormState, fd: FormData): Promise<FormState> {
  const state = await handleWish(fd, (row) => createPublicSupabase().from('wishes').insert(row))
  if (state.status === 'ok') refresh()
  return state
}
