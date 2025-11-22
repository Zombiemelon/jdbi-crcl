"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(80),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  interests: z.string().optional()
});

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormData) => {
    setServerError(null);
    const interests = values.interests
      ? values.interests
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, interests })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setServerError(data.error ?? 'Signup failed.');
      return;
    }

    window.location.href = '/profile-setup';
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Create your crcl. account</h1>
        <p className="mt-1 text-sm text-slate-600">Email signup with basic profile details.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="name">
              Name
            </label>
            <Input id="name" autoComplete="name" {...register('name')} />
            {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="email">
              Email
            </label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
            {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="interests">
              Interests (comma separated)
            </label>
            <Input
              id="interests"
              placeholder="coffee, hiking, books"
              {...register('interests')}
            />
            {errors.interests && (
              <p className="text-xs text-red-600">{errors.interests.message}</p>
            )}
          </div>

          {serverError && <p className="text-sm text-red-600">{serverError}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>
      </div>
    </main>
  );
}
