import React, { useEffect, useRef, useState } from "react";
import { FiWifiOff } from "react-icons/fi";
import { appToast } from "../services/toastService";

export const OfflineBanner = () => {
  const [online, setOnline] = useState(() => typeof navigator === "undefined" ? true : navigator.onLine);
  const wasOffline = useRef(!online);
  useEffect(() => {
    const onOffline = () => { wasOffline.current = true; setOnline(false); };
    const onOnline = () => { setOnline(true); if (wasOffline.current) appToast.info("You’re back online"); wasOffline.current = false; };
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => { window.removeEventListener("offline", onOffline); window.removeEventListener("online", onOnline); };
  }, []);
  if (online) return <span className="sr-only" aria-live="polite">Online</span>;
  return (
    <div className="fixed inset-x-3 top-3 z-toast mx-auto flex max-w-md items-center justify-center gap-2 rounded-pill border border-warning/30 bg-surface-raised px-4 py-2 text-sm font-semibold text-warning shadow-md" role="status" aria-live="assertive">
      <FiWifiOff aria-hidden="true" />You’re offline. Some actions may be unavailable.
    </div>
  );
};
