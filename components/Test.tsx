"use client";

import { useEffect, useRef, useState } from "react";
import { generateQuestion, Question } from "@/lib/questions";
import type { Attempt, Settings } from "@/lib/storage";

export function formatTime(totalSeconds: number) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Test({
    settings,
    onFinish,
}: {
    settings: Settings;
    onFinish: (attempt: Attempt) => void;
}) {
    const totalMs = settings.minutes * 60 * 1000;
    const startRef = useRef(Date.now());
    const seen = useRef(new Set<string>());
    const stats = useRef({ correct: 0, answered: 0 });
    const finished = useRef(false);

    const nextQuestion = (): Question => {
        let q = generateQuestion(settings.digits, settings.spread);
        for (let i = 0; i < 20 && seen.current.has(q.key); i++) {
            q = generateQuestion(settings.digits, settings.spread);
        }
        seen.current.add(q.key);
        return q;
    };

    const [question, setQuestion] = useState<Question>(nextQuestion);
    const [msLeft, setMsLeft] = useState(totalMs);

    const finish = () => {
        if (finished.current) return;
        finished.current = true;
        const elapsed = Math.round((Date.now() - startRef.current) / 1000);
        onFinish({
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
            date: new Date().toISOString(),
            correct: stats.current.correct,
            total: stats.current.answered,
            secondsUsed: Math.min(elapsed, Math.round(settings.minutes * 60)),
            settings,
        });
    };

    // Timer
    useEffect(() => {
        const id = setInterval(() => {
            const left = Math.max(0, totalMs - (Date.now() - startRef.current));
            setMsLeft(left);
            if (left === 0) finish();
        }, 200);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const answer = (n: number) => {
        if (finished.current) return;
        stats.current.answered += 1;
        if (n === question.answer) stats.current.correct += 1;

        if (settings.questions > 0 && stats.current.answered >= settings.questions) {
            finish();
            return;
        }
        setQuestion(nextQuestion());
    };

    // Keyboard shortcuts: 1 / 2 / 3
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const idx = ["1", "2", "3"].indexOf(e.key);
            if (idx !== -1) answer(question.numbers[idx]);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [question]);

    const answered = stats.current.answered;
    const limited = settings.questions > 0;

    const progress = limited
        ? (answered / settings.questions) * 100
        : ((totalMs - msLeft) / totalMs) * 100;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-600">
                    {limited
                        ? `Question ${Math.min(answered + 1, settings.questions)} of ${settings.questions}`
                        : `Question ${answered + 1}`}
                </span>
                <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm">
                    Time left:{" "}
                    <span className="font-mono font-semibold">
                        {formatTime(Math.ceil(msLeft / 1000))}
                    </span>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <span className="rounded border border-slate-300 bg-slate-100 px-2 py-1 text-xs font-semibold tracking-widest text-slate-600">
                    NUMBER SPEED &amp; ACCURACY
                </span>
                <p className="mt-4 text-xl font-semibold text-slate-900">
                    Take the highest and the lowest of these three numbers. Which of them
                    is furthest from the remaining number?
                </p>

                <div className="mt-6 inline-flex gap-10 rounded-xl border border-slate-200 bg-slate-50 px-8 py-5 font-mono text-3xl tracking-wider text-slate-900">
                    {question.numbers.map((n, i) => (
                        <span key={i}>{n}</span>
                    ))}
                </div>

                <div className="mt-6 flex gap-3">
                    {question.numbers.map((n, i) => (
                        <button
                            key={i}
                            onClick={() => answer(n)}
                            className="min-w-20 rounded-lg border border-slate-300 bg-white px-5 py-4 text-lg font-semibold text-slate-900 transition hover:border-slate-800 hover:bg-slate-50 active:scale-95"
                        >
                            {n}
                        </button>
                    ))}
                </div>
            </div>

            <p className="text-sm text-slate-500">
                Click an answer or press 1 / 2 / 3. You cannot go back.
            </p>
        </div>
    );
}