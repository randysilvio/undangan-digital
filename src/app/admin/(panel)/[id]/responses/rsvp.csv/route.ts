import { requireAdmin } from '@/lib/auth'
import { rsvpCsv } from '@/lib/csv'
import { getInvitation, listRsvps } from '@/lib/data/admin'

export async function GET(_req: Request, ctx: RouteContext<'/admin/[id]/responses/rsvp.csv'>) {
  const { id } = await ctx.params
  const { supabase } = await requireAdmin()
  const inv = await getInvitation(supabase, id)
  if (!inv) return new Response('Undangan tidak ditemukan', { status: 404 })
  const rsvps = await listRsvps(supabase, id)
  return new Response(rsvpCsv(rsvps, inv.timezone), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="rsvp-${inv.slug}.csv"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
