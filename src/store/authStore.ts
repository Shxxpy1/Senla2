import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../api/auth";
import { normalizeApiError } from "../api/client";
import type { AuthCredentials, AuthUser, Session } from "../api/types";

type AuthStatus = "idle" | "checking" | "authenticated" | "guest";

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  sessions: Session[];
  sessionsLoading: boolean;
  avatarVersion: number;
  error: string | null;

  /** Проверяет, жива ли сессия (по факту куки), при загрузке приложения. */
  bootstrap: () => Promise<void>;
  login: (payload: AuthCredentials) => Promise<void>;
  register: (payload: AuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  fetchSessions: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  /** Вызывается из SSE-хука, когда прилетает пуш о входе в аккаунт. */
  notifySessionCreated: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      status: "idle",
      sessions: [],
      sessionsLoading: false,
      avatarVersion: 0,
      error: null,

      bootstrap: async () => {
        set({ status: "checking" });
        try {
          // Эндпоинта "/auth/me" в спецификации нет, поэтому достоверность
          // живой HttpOnly-сессии проверяем по факту успешного приватного запроса.
          await authApi.getSessions();
          set({ status: "authenticated" });
        } catch {
          set({ status: "guest", user: null });
        }
      },

      login: async (payload) => {
        set({ error: null });
        try {
          const user = await authApi.login(payload);
          set({
            user: user ?? { id: get().user?.id ?? "", login: payload.login },
            status: "authenticated",
          });
        } catch (e) {
          const apiError = normalizeApiError(e);
          set({ error: apiError.message });
          throw apiError;
        }
      },

      register: async (payload) => {
        set({ error: null });
        try {
          const user = await authApi.register(payload);
          // Если бэкенд после регистрации сразу логинит (ставит куку) — отлично,
          // статус становится authenticated. Если нет — пользователь увидит форму логина.
          set({ user: user ?? { id: "", login: payload.login } });
        } catch (e) {
          const apiError = normalizeApiError(e);
          set({ error: apiError.message });
          throw apiError;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          set({ user: null, status: "guest", sessions: [] });
        }
      },

      deleteAccount: async () => {
        await authApi.deleteAccount();
        set({ user: null, status: "guest", sessions: [] });
      },

      fetchSessions: async () => {
        set({ sessionsLoading: true });
        try {
          const sessions = await authApi.getSessions();
          set({ sessions, sessionsLoading: false, status: "authenticated" });
        } catch (e) {
          set({ sessionsLoading: false });
          const apiError = normalizeApiError(e);
          if (apiError.status === 401) {
            set({ status: "guest", user: null });
          }
          throw apiError;
        }
      },

      revokeSession: async (sessionId: string) => {
        await authApi.revokeSession(sessionId);
        set({ sessions: get().sessions.filter((s) => s.id !== sessionId) });
      },

      uploadAvatar: async (file: File) => {
        await authApi.uploadAvatar(file);
        set({ avatarVersion: get().avatarVersion + 1 });
      },

      notifySessionCreated: () => {
        // Обновляем список сессий, если пользователь сейчас смотрит на экран профиля.
        void get().fetchSessions();
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "task-tracker-auth",
      // В localStorage кладём только не чувствительные данные для UX
      // (сам JWT всегда в HttpOnly-куке и сюда не попадает).
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
