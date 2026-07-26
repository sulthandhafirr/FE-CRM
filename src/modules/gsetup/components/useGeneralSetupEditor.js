import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadGeneralSetup,
  saveGeneralSetup,
  fetchRolesFromApi,
  fetchTicketStatusFromApi,
  fetchSlaConfigFromApi,
} from "../gsetup.service";

const DEFAULT_TOAST = { open: false, message: "", severity: "success" };

/**
 * Hook that manages the General Setup editor state: load, update, save, toast.
 * Role management and ticket status data are loaded from the backend API;
 * other sections fall back to localStorage.
 */
export default function useGeneralSetupEditor() {
  const [settings, setSettings] = useState(loadGeneralSetup);
  const [toast, setToast] = useState(DEFAULT_TOAST);
  const [roleApiLoading, setRoleApiLoading] = useState(true);
  const [ticketStatusApiLoading, setTicketStatusApiLoading] = useState(true);
  const [slaApiLoading, setSlaApiLoading] = useState(true);
  const fileInputRef = useRef(null);

  // Fetch role permissions from the backend API on mount
  useEffect(() => {
    let cancelled = false;

    async function loadRolesFromApi() {
      const apiRoles = await fetchRolesFromApi();
      if (cancelled) return;
      setRoleApiLoading(false);

      if (apiRoles !== null) {
        setSettings((prev) => ({
          ...prev,
          roleManagement: { roles: apiRoles },
        }));
      }
    }

    loadRolesFromApi();

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch ticket status config from the backend API on mount
  useEffect(() => {
    let cancelled = false;

    async function loadTicketStatusFromApi() {
      const apiConfig = await fetchTicketStatusFromApi();
      if (cancelled) return;
      setTicketStatusApiLoading(false);

      if (apiConfig !== null) {
        setSettings((prev) => ({
          ...prev,
          ticketStatus: apiConfig,
        }));
      }
    }

    loadTicketStatusFromApi();

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch SLA rules config from the backend API on mount
  useEffect(() => {
    let cancelled = false;

    async function loadSlaFromApi() {
      const apiConfig = await fetchSlaConfigFromApi();
      if (cancelled) return;
      setSlaApiLoading(false);

      if (apiConfig !== null) {
        setSettings((prev) => ({
          ...prev,
          slaRules: apiConfig,
        }));
      }
    }

    loadSlaFromApi();

    return () => {
      cancelled = true;
    };
  }, []);

  const showToast = useCallback((message, severity = "success") => {
    setToast({ open: true, message, severity });
  }, []);

  const handleCloseToast = useCallback((_, reason) => {
    if (reason === "clickaway") return;
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  const updateSettings = useCallback((section, updater) => {
    setSettings((prev) => {
      const nextSection =
        typeof updater === "function" ? updater(prev[section]) : updater;
      return { ...prev, [section]: nextSection };
    });
  }, []);

  const saveSettings = useCallback((nextSettings, message) => {
    saveGeneralSetup(nextSettings);
    setSettings(nextSettings);
    showToast(message);
  }, [showToast]);

  const isLoading = roleApiLoading || ticketStatusApiLoading || slaApiLoading;

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
