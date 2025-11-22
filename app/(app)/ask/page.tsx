"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { RainbowButton } from "@/registry/magicui/rainbow-button";

const schema = z.object({
  text: z.string().min(1, "Question is required"),
  visibility: z.enum(["inner", "outer"])
});

type FormData = z.infer<typeof schema>;

export default function AskQuestionPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [defaultVisibility, setDefaultVisibility] = useState<"inner" | "outer">("inner");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { text: "", visibility: "inner" }
  });

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        // In the future, pull user preference for default circle if stored.
        setDefaultVisibility("inner");
        setValue("visibility", "inner");
      }
      setLoadingProfile(false);
    };
    load();
  }, [setValue]);

  const submit = async (values: FormData) => {
    setServerError(null);
    setServerSuccess(null);
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setServerError(data.error ?? "Failed to post question.");
      return;
    }
    setServerSuccess("Question posted to your circle.");
    setValue("text", "");
    setValue("visibility", defaultVisibility);
  };

  const currentVisibility = watch("visibility", defaultVisibility);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12 sm:px-8">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-slate-100">
            Ask your circle
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold sm:text-4xl">Ask a question.</h1>
            <p className="text-sm text-slate-200 sm:text-base">
              Send a question to your inner or outer circle and collect answers from trusted people.
            </p>
          </div>
        </header>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
          <form onSubmit={handleSubmit(submit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white" htmlFor="text">
                Your question
              </label>
              <textarea
                id="text"
                rows={4}
                disabled={loadingProfile || isSubmitting}
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/60"
                placeholder="E.g., Best coffee roaster that delivers in 2 days?"
                {...register("text")}
              />
              {errors.text && <p className="text-xs text-red-400">{errors.text.message}</p>}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-white">Choose circle</p>
              <div className="flex flex-wrap gap-3">
                {(["inner", "outer"] as const).map((option) => {
                  const active = option === currentVisibility;
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={isSubmitting || loadingProfile}
                      onClick={() => setValue("visibility", option)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        option === "inner"
                          ? active
                            ? "bg-emerald-300 text-emerald-950"
                            : "border border-white/20 bg-white/10 text-white"
                          : active
                            ? "bg-indigo-300 text-indigo-950"
                            : "border border-white/20 bg-white/10 text-white"
                      }`}
                    >
                      {option === "inner" ? "Inner circle" : "Outer circle"}
                    </button>
                  );
                })}
              </div>
              {errors.visibility && (
                <p className="text-xs text-red-400">{errors.visibility.message}</p>
              )}
            </div>

            {serverError && <p className="text-sm text-red-400">{serverError}</p>}
            {serverSuccess && <p className="text-sm text-emerald-300">{serverSuccess}</p>}

            <div className="flex items-center gap-3">
              <RainbowButton type="submit" variant="outline" disabled={isSubmitting || loadingProfile}>
                {isSubmitting ? "Posting..." : "Post question"}
              </RainbowButton>
              <p className="text-xs text-slate-300">
                Visibility: Inner = closest friends. Outer = wider trusted circle.
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
