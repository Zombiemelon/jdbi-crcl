"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Star } from 'lucide-react';
import { RainbowButton } from '@/registry/magicui/rainbow-button';

type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  credibilityScore: number;
  interests: string[];
};

type Recommendation = {
  id: string;
  title: string;
  text: string;
  circle: "inner" | "outer";
  credibility: number;
  replies: number;
  likes: number;
};

const sampleRecommendations: Recommendation[] = [
  {
    id: "r1",
    title: "Brunch spot",
    text: "Try Elm & Pine for weekend brunch—best sourdough pancakes.",
    circle: "inner",
    credibility: 82,
    replies: 6,
    likes: 24
  },
  {
    id: "r2",
    title: "Hiking trail",
    text: "Ridgeview Loop at sunrise; light traffic and great views.",
    circle: "outer",
    credibility: 75,
    replies: 3,
    likes: 18
  },
  {
    id: "r3",
    title: "Coffee beans",
    text: "Northbound Roasters, Ethiopia Guji. Sweet berry notes and super clean.",
    circle: "inner",
    credibility: 88,
    replies: 4,
    likes: 31
  }
];

export default function UserProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/auth/me");
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      const data = await res.json();
      setProfile(data.user);
      setLoading(false);
    };
    load();
  }, [router]);

  const credibilityLabel = useMemo(() => {
    const score = profile?.credibilityScore ?? 0;
    if (score >= 80) return "Trusted";
    if (score >= 50) return "Growing";
    return "New";
  }, [profile]);

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-8">
        <header className="flex flex-col gap-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-slate-100">
            Your profile
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold sm:text-4xl">
              {loading ? "Loading..." : profile?.name || "Your name"}
            </h1>
            <p className="text-sm text-slate-200 sm:text-base">
              View your credibility, interests, and recent recommendations shared with circles.
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
            <div className="flex flex-wrap items-center gap-4">
              <div className="rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200">
                Credibility {profile?.credibilityScore ?? 0}
              </div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white">
                {credibilityLabel}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-slate-200">
                Based on direct relationships, manual trust, feedback, and circle weight.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Stat label="Recommendations" value="12" />
              <Stat label="Replies" value="28" />
              <Stat label="Circle reach" value="48" />
            </div>

            <div className="mt-6">
              <h2 className="text-sm font-semibold text-white">Interests</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {(profile?.interests ?? []).length === 0 && (
                  <span className="text-sm text-slate-300">No interests yet.</span>
                )}
                {(profile?.interests ?? []).map((interest) => (
                  <span
                    key={interest}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-white"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white text-slate-900 shadow-xl ring-1 ring-white/10">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold">Recent recommendations</h2>
              <p className="text-sm text-slate-500">
                Shared with your inner and outer circles.
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {sampleRecommendations.map((rec) => (
                <article key={rec.id} className="flex flex-col gap-3 px-6 py-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{rec.title}</p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        rec.circle === "inner"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-indigo-100 text-indigo-800"
                      }`}
                    >
                      {rec.circle} circle
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{rec.text}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                    <Badge icon={<Star size={14} />} label={`${rec.credibility} credibility`} />
                    <Badge icon={<MessageCircle size={14} />} label={`${rec.replies} replies`} />
                    <Badge icon={<Heart size={14} />} label={`${rec.likes} thanks`} />
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
      <div className="pointer-events-none fixed inset-x-0 bottom-8 flex justify-center">
        <Link href="/ask" className="pointer-events-auto">
          <RainbowButton variant="outline" className="px-6 py-2.5 text-sm">
            Ask your circle
          </RainbowButton>
        </Link>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white">
      <p className="text-xs uppercase tracking-wide text-slate-200">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Badge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
      {icon}
      {label}
    </span>
  );
}
