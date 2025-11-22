"use client";

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(80)
});

type FormData = z.infer<typeof schema>;

const defaultInterests = [
  'coffee',
  'restaurants',
  'travel',
  'fitness',
  'hiking',
  'books',
  'parenting',
  'tech',
  'home',
  'beauty',
  'pets',
  'music'
];

export default function ProfileSetupPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' }
  });

  useEffect(() => {
    const loadProfile = async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      setValue('name', data.user?.name ?? '');
      setSelected(data.user?.interests ?? []);
      setLoading(false);
    };
    loadProfile();
  }, [setValue]);

  const toggleInterest = (interest: string) => {
    setSelected((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const sortedInterests = useMemo(
    () => [...new Set([...selected, ...defaultInterests])],
    [selected]
  );

  const onSubmit = async (values: FormData) => {
    setServerError(null);
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: values.name, interests: selected })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setServerError(data.error ?? 'Failed to save profile.');
      return;
    }
    window.location.href = '/circle-setup';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-12 sm:px-8">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-slate-100">
            Profile setup
          </div>
          <div className="max-w-3xl space-y-2">
            <h1 className="text-3xl font-semibold sm:text-4xl">Tell us who you are.</h1>
            <p className="text-sm text-slate-200 sm:text-base">
              Set your name and pick a few interests so your circles can recommend the good stuff.
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
          <div className="rounded-2xl bg-white text-slate-900 shadow-xl ring-1 ring-white/10">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold">Profile basics</h2>
              <p className="text-sm text-slate-500">Name is shared with your trusted circles.</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-800" htmlFor="name">
                  Name
                </label>
                <Input
                  id="name"
                  placeholder="Your name"
                  autoComplete="name"
                  disabled={loading || isSubmitting}
                  {...register('name')}
                />
                {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
              </div>

              {serverError && <p className="text-sm text-red-600">{serverError}</p>}

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isSubmitting || loading} className="px-5">
                  {isSubmitting ? 'Saving...' : 'Save & continue'}
                </Button>
                <Button
                  type="button"
                  disabled={isSubmitting || loading}
                  className="bg-slate-100 text-slate-800 hover:bg-slate-200"
                  onClick={() => window.location.href = '/circle-setup'}
                >
                  Skip for now
                </Button>
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Interests</p>
                <p className="text-xs text-slate-200">Pick a few to tune recommendations.</p>
              </div>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
                {selected.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sortedInterests.map((interest) => {
                const active = selected.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-full border px-3 py-1 text-sm transition ${
                      active
                        ? 'border-emerald-300 bg-emerald-200/30 text-emerald-100'
                        : 'border-white/20 bg-white/10 text-white hover:border-white/40'
                    }`}
                    disabled={isSubmitting || loading}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-slate-200">
              You can edit interests anytime in settings. We start with a few common picks; add more
              as you explore.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
