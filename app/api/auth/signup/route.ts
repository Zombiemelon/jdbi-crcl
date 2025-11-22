import { NextRequest, NextResponse } from 'next/server';
import { signupSchema } from '@/lib/validation/auth';
import { getServiceRoleSupabase } from '@/lib/supabase/server';
import type { SignupResponse } from '@/lib/types/api';

export async function POST(req: NextRequest) {
  const supabase = getServiceRoleSupabase();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed.', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { email, password, name, interests = [] } = parsed.data;

  const { data: userResp, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name }
  });

  if (authError || !userResp.user) {
    return NextResponse.json(
      { error: authError?.message ?? 'Signup failed.' },
      { status: 400 }
    );
  }

  const userId = userResp.user.id;

  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,
    email,
    name,
    interests,
    credibility_score: 0
  });

  if (profileError) {
    return NextResponse.json(
      { error: 'Profile creation failed.', detail: profileError.message },
      { status: 400 }
    );
  }

  await supabase.from('circles').insert([
    { owner_id: userId, name: 'inner' },
    { owner_id: userId, name: 'outer' }
  ]);

  const payload: SignupResponse = { userId };
  return NextResponse.json(payload, { status: 201 });
}
