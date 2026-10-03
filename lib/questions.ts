export type Question = {
    numbers: [number, number, number]; // display order (shuffled)
    answer: number;
    key: string;
};

function randInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function pickNumbers(min: number, max: number, spread: number): number[] {
    if (spread > 0) {
        const lo = randInt(min, Math.max(min, max - spread));
        const hi = Math.min(max, lo + spread);
        return [randInt(lo, hi), randInt(lo, hi), randInt(lo, hi)];
    }
    return [randInt(min, max), randInt(min, max), randInt(min, max)];
}

/**
 * Question: take the highest and lowest of three numbers.
 * Which of them is furthest from the remaining (middle) number?
 *
 * maxDigits: each question uses 1..maxDigits digits (1-8)
 * spread: max gap between highest and lowest (0 = fully random, otherwise >= 3)
 */
export function generateQuestion(maxDigits: number, spread: number): Question {
    for (let attempt = 0; attempt < 500; attempt++) {
        const digits = randInt(1, maxDigits);
        const min = digits === 1 ? 1 : 10 ** (digits - 1);
        const max = 10 ** digits - 1;

        const nums = pickNumbers(min, max, attempt > 100 ? 0 : spread);
        const [lo, mid, hi] = [...nums].sort((a, b) => a - b);

        const distinct = lo !== mid && mid !== hi;
        const noTie = mid - lo !== hi - mid;
        if (!distinct || !noTie) continue;

        const answer = mid - lo > hi - mid ? lo : hi;
        return {
            numbers: shuffle([lo, mid, hi]) as [number, number, number],
            answer,
            key: `${lo}-${mid}-${hi}`,
        };
    }

    // Practically unreachable fallback
    return { numbers: [1, 5, 6], answer: 1, key: "1-5-6" };
}

/** Explanation text for the review page, derived from the three numbers. */
export function explain(numbers: number[]): string {
    const [lo, mid, hi] = [...numbers].sort((a, b) => a - b);
    const dHi = hi - mid;
    const dLo = mid - lo;
    const [far, farD, near, nearD] =
        dHi > dLo ? [hi, dHi, lo, dLo] : [lo, dLo, hi, dHi];
    return `Highest is ${hi}, lowest is ${lo}, middle is ${mid}. ${far} is ${farD} away from ${mid}, while ${near} is ${nearD} away — so ${far} is furthest.`;
}