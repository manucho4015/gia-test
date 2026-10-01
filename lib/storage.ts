export type Settings = {
    digits: number;
    minutes: number;
    questions: number; // 0 = unlimited until time runs out
    spread: number; // 0 = fully random
};

export type Attempt = {
    id: string;
    date: string; // ISO
    correct: number;
    total: number; // questions answered
    secondsUsed: number;
    settings: Settings;
};

export const DEFAULT_SETTINGS: Settings = {
    digits: 3,
    minutes: 4,
    questions: 24,
    spread: 20,
};

const ATTEMPTS_KEY = "gia-nsa-attempts";
const SETTINGS_KEY = "gia-nsa-settings";

export function loadAttempts(): Attempt[] {
    try {
        const raw = localStorage.getItem(ATTEMPTS_KEY);
        return raw ? (JSON.parse(raw) as Attempt[]) : [];
    } catch {
        return [];
    }
}

export function saveAttempt(attempt: Attempt): Attempt[] {
    const updated = [attempt, ...loadAttempts()];
    try {
        localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(updated));
    } catch { }
    return updated;
}

export function clearAttempts() {
    try {
        localStorage.removeItem(ATTEMPTS_KEY);
    } catch { }
}

export function loadSettings(): Settings {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
    } catch {
        return DEFAULT_SETTINGS;
    }
}

export function saveSettings(settings: Settings) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch { }
}