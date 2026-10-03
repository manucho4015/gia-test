"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { explain } from "@/lib/questions";
import {
    Attempt,
    deleteAttempt,
    getAttempt,
    saveSettings,
} from "@/lib/storage";
import { formatTime } from "@/components/Test";

function StatCard({
    label,
    value,
    sub,
    accent,
    valueClass = "text-slate-900",
}: {
    label: string;
    value: string;
    sub?: string;
    accent: string;
    valueClass?: string;
}) {
    return (
        <div
            className={`rounded-xl border border-slate-200 border-t-4 bg-white p-5 shadow-sm ${accent}`}
        >
            <div className="text-xs font-semibold tracking-widest text-slate-500">
                {label}
            </div>
            <div className={`mt-2 text-3xl font-bold ${valueClass}`}>{value}</div>
            {sub && <div className="mt-1 text-sm text-slate-500">{sub}</div>}
        </div>
    );
}

export default function AttemptPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    // undefined = still loading, null = not found
    const [attempt, setAttempt] = useState<Attempt | null | undefined>(undefined);
    const [showReview, setShowReview] = useState(true);

    useEffect(() => {
        setAttempt(getAttempt(id));
    }, [id]);

    const retake = () => {
        if (!attempt) return;
        saveSettings(attempt.settings);
        router.push("/?start=1");
    };

    const remove = () => {
        if (!attempt) return;
        if (!confirm("Delete this attempt?")) return;
        deleteAttempt(attempt.id);
        router.push("/");
    };

    const header = (
        <header className="bg-slate-900 px-6 py-4 text-white">
            <div className="mx-auto max-w-4xl">
                <div className="text-xs font-semibold tracking-widest text-amber-400">
                    GIA PRACTICE
                </div>
                <div className="text-lg font-semibold">Number Speed &amp; Accuracy</div>
            </div>
        </header>
    );

    if (attempt === undefined) {
        return <main className="min-h-screen bg-slate-100">{header}</main>;
    }

    if (attempt === null) {
        return (
            <main className="min-h-screen bg-slate-100 text-slate-900">
                {header}
                <div className="mx-auto max-w-4xl px-6 py-8">
                    <p className="text-slate-600">This attempt could not be found.</p>
                    <Link href="/" className="mt-4 inline-block font-semibold underline">
                        Back to Home
                    </Link>
                </div>
            </main>
        );
    }

    const incorrect = attempt.total - attempt.correct;
    const pct = attempt.total
        ? Math.round((attempt.correct / attempt.total) * 100)
        : 0;
    const perQ = attempt.total
        ? (attempt.secondsUsed / attempt.total).toFixed(1)
        : null;
    const s = attempt.settings;

    return (
        <main className="min-h-screen bg-slate-100 text-slate-900">
            {header}

            <div className="mx-auto max-w-4xl space-y-8 px-6 py-8">
                <section>
                    <div className="text-xs font-semibold tracking-widest text-amber-700">
                        STATEMENT OF RESULTS
                    </div>
                    <h1 className="mt-1 text-3xl font-bold">Test Results</h1>
                    <p className="mt-2 text-slate-600">
                        Completed{" "}
                        {new Date(attempt.date).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                        })}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                        Up to {s.digits}-digit ·{" "}
                        {s.spread > 0 ? `spread ${s.spread}` : "fully random"} ·{" "}
                        {s.minutes} min timer ·{" "}
                        {s.questions > 0 ? `${s.questions} questions` : "until time runs out"}
                    </p>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="SCORE"
                        value={`${attempt.correct}/${attempt.total}`}
                        sub={`${pct}%`}
                        accent="border-t-slate-700"
                    />
                    <StatCard
                        label="CORRECT"
                        value={String(attempt.correct)}
                        accent="border-t-emerald-600"
                        valueClass="text-emerald-700"
                    />
                    <StatCard
                        label="INCORRECT"
                        value={String(incorrect)}
                        accent="border-t-rose-600"
                        valueClass="text-rose-600"
                    />
                    <StatCard
                        label="TIME TAKEN"
                        value={formatTime(attempt.secondsUsed)}
                        sub={perQ ? `${perQ}s per question` : undefined}
                        accent="border-t-amber-600"
                    />
                </section>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={retake}
                        className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-700"
                    >
                        Retake Test
                    </button>
                    <button
                        onClick={() => setShowReview((v) => !v)}
                        className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-900 hover:bg-slate-50"
                    >
                        {showReview ? "Hide Review" : "Show Review"}
                    </button>
                    <Link
                        href="/"
                        className="px-3 py-2.5 text-sm font-bold text-slate-700 hover:underline"
                    >
                        Back to Home
                    </Link>
                    <button
                        onClick={remove}
                        className="px-3 py-2.5 text-sm font-bold text-red-600 hover:underline"
                    >
                        Delete Attempt
                    </button>
                </div>

                {showReview && (
                    <section>
                        <h2 className="mb-4 text-2xl font-bold">Answer Review</h2>

                        {!attempt.questions || attempt.questions.length === 0 ? (
                            <p className="text-sm text-slate-500">
                                Question details weren&apos;t recorded for this attempt (it was
                                saved before the review feature existed).
                            </p>
                        ) : (
                            <div className="space-y-5">
                                {attempt.questions.map((q, i) => {
                                    const ok = q.userAnswer === q.correctAnswer;
                                    return (
                                        <div
                                            key={i}
                                            className={`rounded-xl border border-slate-200 border-l-4 bg-white p-6 shadow-sm ${ok ? "border-l-emerald-600" : "border-l-rose-600"
                                                }`}
                                        >
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className="font-semibold">Question {i + 1}</span>
                                                <span className="rounded border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-semibold tracking-widest text-slate-600">
                                                    NUMBER SPEED &amp; ACCURACY
                                                </span>
                                                <span
                                                    className={`rounded px-2 py-0.5 text-xs font-bold tracking-widest ${ok
                                                        ? "bg-emerald-100 text-emerald-800"
                                                        : "bg-rose-100 text-rose-700"
                                                        }`}
                                                >
                                                    {ok ? "CORRECT" : "INCORRECT"}
                                                </span>
                                                <span className="ml-auto font-mono text-sm text-slate-400">
                                                    {q.seconds.toFixed(1)}s
                                                </span>
                                            </div>

                                            <p className="mt-4 text-lg">
                                                Take the highest and the lowest of these three numbers.
                                                Which of them is furthest from the remaining number?
                                            </p>

                                            <div className="mt-4 inline-flex gap-8 rounded-xl border border-slate-200 bg-slate-50 px-6 py-4 font-mono text-2xl text-slate-900">
                                                {q.numbers.map((n, j) => (
                                                    <span key={j}>{n}</span>
                                                ))}
                                            </div>

                                            <div className="mt-4 text-sm">
                                                <div className="text-slate-500">Your answer</div>
                                                <div className="font-medium">{q.userAnswer}</div>
                                            </div>

                                            {!ok && (
                                                <div className="mt-3 text-sm">
                                                    <div className="text-slate-500">Correct answer</div>
                                                    <div className="font-medium text-emerald-700">
                                                        {q.correctAnswer}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-3 text-sm">
                                                <div className="text-slate-500">Explanation</div>
                                                <div>{explain(q.numbers)}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}
            </div>
        </main>
    );
}