"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { AnimatePresence } from "framer-motion";

import { MotionDiv } from "./motion-provider";

type ToastVariant = "success" | "error" | "info";

interface ToastPayload {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface FeedbackContextValue {
  notify: (payload: Omit<ToastPayload, "id"> & { vibrate?: boolean }) => void;
  dismiss: (id: string) => void;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  toggleSound: () => void;
  toggleHaptics: () => void;
}

const FeedbackContext = createContext<FeedbackContextValue | undefined>(undefined);

const PREFS_KEY = "gamy-ludo-feedback-prefs";

const toneDuration = 0.18;
const toneFrequency = 880;

const playTone = async (enabled: boolean) => {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AudioContextCtor =
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ??
      window.AudioContext;
    if (!AudioContextCtor) {
      return;
    }
    const ctx = new AudioContextCtor();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.value = toneFrequency;
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + toneDuration);
    oscillator.stop(ctx.currentTime + toneDuration);
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
  } catch (error) {
    console.warn("Unable to play notification tone", error);
  }
};

const triggerHaptics = (enabled: boolean, vibrate = true) => {
  if (!enabled || !vibrate) return;
  if (typeof window === "undefined") return;
  try {
    window.navigator?.vibrate?.(30);
  } catch (error) {
    console.warn("Unable to trigger vibration", error);
  }
};

interface ToastState extends ToastPayload {
  createdAt: number;
}

interface FeedbackProviderProps {
  children: React.ReactNode;
}

export const FeedbackProvider = ({ children }: FeedbackProviderProps) => {
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(PREFS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.soundEnabled === "boolean") {
          setSoundEnabled(parsed.soundEnabled);
        }
        if (typeof parsed.hapticsEnabled === "boolean") {
          setHapticsEnabled(parsed.hapticsEnabled);
        }
      }
    } catch (error) {
      console.warn("Unable to parse feedback preferences", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ soundEnabled, hapticsEnabled })
    );
  }, [soundEnabled, hapticsEnabled]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutsRef.current.clear();
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const notify = useCallback<FeedbackContextValue["notify"]>(
    (payload) => {
      const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
      const toast: ToastState = {
        ...payload,
        id,
        createdAt: Date.now(),
        variant: payload.variant ?? "info"
      };

      setToasts((current) => [...current, toast]);
      playTone(soundEnabled).catch(() => {});
      triggerHaptics(hapticsEnabled, payload.vibrate);

      const timeoutId = setTimeout(() => dismiss(id), 4200);
      timeoutsRef.current.set(id, timeoutId);
    },
    [dismiss, hapticsEnabled, soundEnabled]
  );

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  const toggleHaptics = useCallback(() => {
    setHapticsEnabled((prev) => !prev);
  }, []);

  const value = useMemo<FeedbackContextValue>(
    () => ({ notify, dismiss, soundEnabled, hapticsEnabled, toggleSound, toggleHaptics }),
    [dismiss, hapticsEnabled, notify, soundEnabled]
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-20 z-[100] flex justify-center px-4">
        <div className="flex w-full max-w-md flex-col gap-3">
          <AnimatePresence>
            {toasts.map((toast) => (
              <MotionDiv
                key={toast.id}
                initial={{ opacity: 0, y: -12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.95 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-xl shadow-black/30 backdrop-blur ${
                  toast.variant === "success"
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-100"
                    : toast.variant === "error"
                      ? "border-red-500/30 bg-red-500/10 text-red-100"
                      : "border-sky-500/30 bg-sky-500/10 text-sky-100"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{toast.title}</p>
                    {toast.description ? (
                      <p className="text-xs text-white/80">{toast.description}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => dismiss(toast.id)}
                    className="text-xs font-medium uppercase tracking-wide text-white/60 transition hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </MotionDiv>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback must be used within FeedbackProvider");
  }
  return context;
};
