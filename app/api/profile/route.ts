import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRouteHandlerSupabase } from '@/lib/supabase/server';

const profileSchema = z.object({
  name: z.string().min(1).max(80),
  interests: z.array(z.string()).max(20)
});

export async function POST(req: NextRequest) {
  const supabase = getRouteHandlerSupabase();

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, interests } = parsed.data;

  const { error } = await supabase
    .from('profiles')
    .update({ name, interests })
    .eq('id', user.id);

  if (error) {
    return NextResponse.json(
      { error: 'Failed to update profile', detail: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
