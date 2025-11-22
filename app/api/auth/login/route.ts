import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validation/auth';
import type { AuthUserResponse } from '@/lib/types/api';
import { getRouteHandlerSupabase } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = getRouteHandlerSupabase();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed.', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data?.user) {
    return NextResponse.json(
      { error: error?.message ?? 'Invalid credentials.' },
      { status: 401 }
    );
  }

  const userId = data.user.id;
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, interests, credibility_score')
    .eq('id', userId)
    .single();

  if (profileError) {
    return NextResponse.json(
      { error: 'Could not load profile.', detail: profileError.message },
      { status: 500 }
    );
  }

  const payload: AuthUserResponse = {
    user: {
      id: userId,
      email: data.user.email ?? null,
      name: profile?.name ?? null,
      interests: profile?.interests ?? [],
      credibilityScore: profile?.credibility_score ?? 0
    }
  };

  return NextResponse.json(payload);
}
