import { NextResponse } from 'next/server';
import { getRouteHandlerSupabase } from '@/lib/supabase/server';
import type { AuthUserResponse } from '@/lib/types/api';

export async function GET() {
  const supabase = getRouteHandlerSupabase();

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, interests, credibility_score')
    .eq('id', user.id)
    .single();

  if (profileError) {
    return NextResponse.json(
      { error: 'Could not load profile.', detail: profileError.message },
      { status: 500 }
    );
  }

  const payload: AuthUserResponse = {
    user: {
      id: user.id,
      email: user.email,
      name: profile?.name ?? null,
      interests: profile?.interests ?? [],
      credibilityScore: profile?.credibility_score ?? 0
    }
  };

  return NextResponse.json(payload);
}
