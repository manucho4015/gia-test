"use client";

import type { Attempt } from "@/lib/storage";
import { formatTime } from "./Test";

export default function History({
    attempts,
    onClear,
}: {
    attempts: Attempt[];
    onClear: () => void;
}) {
    if (attempts.length === 0) {
        return (
            <p className="text-sm text-slate-500">
                No attempts yet. Finish a test and it will show up here.
            </p>
        );
    }

    return (
        <div>
            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Recent attempts</h2>
                <button
                    onClick={() => {
                        if (confirm("Delete all saved attempts?")) onClear();
                    }}
                    className="text-sm text-slate-500 underline hover:text-slate-900"
                >
                    Clear history
                </button>
            </div>

            <ul className="space-y-3">
                {attempts.slice(0, 20).map((a) => {
                    const pct = a.total ? Math.round((a.correct / a.total) * 100) : 0;
                    const perQ = a.total ? (a.secondsUsed / a.total).toFixed(1) : "–";
                    return (
                        <li
                            key={a.id}
                            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm"
                        >
                            <div>
                                <div className="font-semibold text-slate-900">
                                    {a.correct}/{a.total}{" "}
                                    <span className="font-normal text-slate-500">({pct}%)</span>
                                </div>
                                <div className="text-sm text-slate-500">
                                    {new Date(a.date).toLocaleString()}
                                </div>
                                <div className="text-xs text-slate-400">
                                    up to {a.settings.digits}-digit ·{" "}
                                    {a.settings.spread > 0 ? `spread ${a.settings.spread}` : "fully random"}
                                </div>
                            </div>
                            <div className="text-right font-mono text-sm text-slate-700">
                                <div>{formatTime(a.secondsUsed)}</div>
                                <div className="text-xs text-slate-400">{perQ}s / question</div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}