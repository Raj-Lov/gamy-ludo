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

interface PwaContextValue {
  registration: ServiceWorkerRegistration | null;
  installPromptEvent: BeforeInstallPromptEvent | null;
  isInstalled: boolean;
  notificationPermission: NotificationPermission;
  notificationsSupported: boolean;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  showInstallPrompt: () => Promise<void>;
}

const PwaContext = createContext<PwaContextValue | undefined>(undefined);

export const PwaProvider = ({ children }: { children: React.ReactNode }) => {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification === "undefined" ? "default" : Notification.permission
  );
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);

  const notificationsSupported = useMemo(
    () => typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator,
    []
  );

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const detectInstalled = () => {
      const standalone = window.matchMedia("(display-mode: standalone)").matches;
      const navigatorStandalone = (window.navigator as typeof navigator & { standalone?: boolean }).standalone;
      setIsInstalled(Boolean(standalone || navigatorStandalone));
    };

    detectInstalled();
    window.matchMedia("(display-mode: standalone)").addEventListener("change", detectInstalled);

    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      promptRef.current = event;
      setInstallPromptEvent(event);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const register = async () => {
      try {
        const swRegistration = await navigator.serviceWorker.register("/service-worker.js");
        setRegistration(swRegistration);
      } catch (error) {
        console.error("Failed to register service worker", error);
      }
    };

    register();

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.matchMedia("(display-mode: standalone)").removeEventListener("change", detectInstalled);
    };
  }, []);

  useEffect(() => {
    if (!notificationsSupported) return;
    setNotificationPermission(Notification.permission);
  }, [notificationsSupported]);

  const requestNotificationPermission = useCallback(async () => {
    if (!notificationsSupported) {
      return "denied";
    }
    try {
      const result = await Notification.requestPermission();
      setNotificationPermission(result);
      if (result === "granted" && registration) {
        await registration.update();
      }
      return result;
    } catch (error) {
      console.error("Failed to request notification permission", error);
      setNotificationPermission("denied");
      return "denied";
    }
  }, [notificationsSupported, registration]);

  const showInstallPrompt = useCallback(async () => {
    const prompt = promptRef.current;
    if (!prompt) return;
    try {
      await prompt.prompt();
      await prompt.userChoice;
      promptRef.current = null;
      setInstallPromptEvent(null);
      setIsInstalled(true);
    } catch (error) {
      console.error("Install prompt failed", error);
    }
  }, []);

  const value = useMemo<PwaContextValue>(
    () => ({
      registration,
      installPromptEvent,
      isInstalled,
      notificationPermission,
      notificationsSupported,
      requestNotificationPermission,
      showInstallPrompt
    }),
    [
      installPromptEvent,
      isInstalled,
      notificationPermission,
      notificationsSupported,
      registration,
      requestNotificationPermission,
      showInstallPrompt
    ]
  );

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
};

export const usePwa = () => {
  const context = useContext(PwaContext);
  if (!context) {
    throw new Error("usePwa must be used within a PwaProvider");
  }
  return context;
};
