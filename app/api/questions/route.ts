import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRouteHandlerSupabase } from '@/lib/supabase/server';

const questionSchema = z.object({
  text: z.string().min(1, 'Question is required'),
  visibility: z.enum(['inner', 'outer'])
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

  const parsed = questionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { text, visibility } = parsed.data;

  const { data, error } = await supabase
    .from('questions')
    .insert({ text, visibility, author_id: user.id })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json(
      { error: 'Failed to post question', detail: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ questionId: data?.id }, { status: 201 });
}
