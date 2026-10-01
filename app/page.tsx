"use client";

import { useCallback, useEffect, useState } from "react";
import Test from "@/components/Test";
import History from "@/components/History";
import {
  Attempt,
  DEFAULT_SETTINGS,
  Settings,
  clearAttempts,
  loadAttempts,
  loadSettings,
  saveAttempt,
  saveSettings,
} from "@/lib/storage";

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

function Field({
  label,
  hint,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <input
        type="number"
        step={step}
        value={Number.isNaN(value) ? "" : value}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
      />
      <span className="text-xs text-slate-500">{hint}</span>
    </label>
  );
}

export default function Home() {
  const [phase, setPhase] = useState<"setup" | "running" | "done">("setup");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [last, setLast] = useState<Attempt | null>(null);

  useEffect(() => {
    setSettings(loadSettings());
    setAttempts(loadAttempts());
  }, []);

  const start = () => {
    const spread = Math.round(settings.spread) || 0;
    const clean: Settings = {
      digits: clamp(Math.round(settings.digits) || 3, 1, 8),
      minutes: clamp(settings.minutes || 4, 0.5, 60),
      questions: clamp(Math.round(settings.questions) || 0, 0, 500),
      spread: spread <= 0 ? 0 : Math.max(3, spread),
    };
    setSettings(clean);
    saveSettings(clean);
    setPhase("running");
  };

  const handleFinish = useCallback((attempt: Attempt) => {
    setAttempts(saveAttempt(attempt));
    setLast(attempt);
    setPhase("done");
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-slate-900 px-6 py-4 text-white">
        <div className="mx-auto max-w-3xl">
          <div className="text-xs font-semibold tracking-widest text-amber-400">
            GIA PRACTICE
          </div>
          <div className="text-lg font-semibold">Number Speed &amp; Accuracy</div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-8 px-6 py-8">
        {phase === "running" && (
          <Test settings={settings} onFinish={handleFinish} />
        )}

        {phase === "done" && last && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="text-sm font-semibold tracking-widest text-slate-500">
              RESULT
            </div>
            <div className="mt-2 text-5xl font-bold">
              {last.correct}/{last.total}
            </div>
            <div className="mt-1 text-slate-600">
              {last.total ? Math.round((last.correct / last.total) * 100) : 0}%
              accuracy
              {last.total > 0 &&
                ` · ${(last.secondsUsed / last.total).toFixed(1)}s per question`}
            </div>
            <button
              onClick={() => setPhase("setup")}
              className="mt-6 rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-700"
            >
              Back to setup
            </button>
          </div>
        )}

        {phase === "setup" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-xl font-bold">Settings</h1>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field
                label="Max digits per number"
                hint="1 to 8. Questions use between 1 and this many digits. Default 3."
                value={settings.digits}
                onChange={(n) => setSettings((s) => ({ ...s, digits: n }))}
              />
              <Field
                label="Timer (minutes)"
                hint="Decimals allowed, e.g. 2.5."
                step={0.5}
                value={settings.minutes}
                onChange={(n) => setSettings((s) => ({ ...s, minutes: n }))}
              />
              <Field
                label="Number of questions"
                hint="0 = keep going until time runs out."
                value={settings.questions}
                onChange={(n) => setSettings((s) => ({ ...s, questions: n }))}
              />
              <Field
                label="Spread"
                hint="Max gap between highest and lowest number. 0 = fully random, otherwise 3 or more."
                value={settings.spread}
                onChange={(n) => setSettings((s) => ({ ...s, spread: n }))}
              />
            </div>
            <button
              onClick={start}
              className="mt-6 rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-700"
            >
              Start test
            </button>
          </div>
        )}

        {phase !== "running" && (
          <History
            attempts={attempts}
            onClear={() => {
              clearAttempts();
              setAttempts([]);
            }}
          />
        )}
      </div>
    </main>
  );
}