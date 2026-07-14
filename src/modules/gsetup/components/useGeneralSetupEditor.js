import { useRef, useState } from "react";
import { loadGeneralSetup, saveGeneralSetup } from "../gsetup.service";

const DEFAULT_TOAST = { open: false, message: "", severity: "success" };

/**
 * Hook that manages the General Setup editor state: load, update, save, toast.
 * Synchronously initialises from localStorage, so no loading state is needed.
 */
export default function useGeneralSetupEditor() {
  const [settings, setSettings] = useState(loadGeneralSetup);
  const [toast, setToast] = useState(DEFAULT_TOAST);
  const fileInputRef = useRef(null);

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = (_, reason) => {
    if (reason === "clickaway") return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  const updateSettings = (section, updater) => {
    setSettings((prev) => {
      const nextSection = typeof updater === "function" ? updater(prev[section]) : updater;
      return { ...prev, [section]: nextSection };
    });
  };

  const saveSettings = (nextSettings, message) => {
    saveGeneralSetup(nextSettings);
    setSettings(nextSettings);
    showToast(message);
  };

  // isLoading is always false because localStorage is synchronous.
  // Kept as a constant so the consuming API remains stable.
  const isLoading = false;

  return {
    settings,
    isLoading,
    toast,
    fileInputRef,
    showToast,
    handleCloseToast,
    updateSettings,
    saveSettings,
  };
}
