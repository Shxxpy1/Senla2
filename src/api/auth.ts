import { apiClient, buildAssetUrl } from "./client";
import type { AuthCredentials, AuthUser, Session } from "./types";

export const authApi = {
  async register(payload: AuthCredentials): Promise<AuthUser | void> {
    const { data } = await apiClient.post<AuthUser | void>("/auth/register", payload);
    return data;
  },

  async login(payload: AuthCredentials): Promise<AuthUser | void> {
    const { data } = await apiClient.post<AuthUser | void>("/auth/login", payload);
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  async getSessions(): Promise<Session[]> {
    const { data } = await apiClient.get<Session[]>("/auth/sessions");
    return data;
  },

  async revokeSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/auth/sessions/${sessionId}`);
  },

  async deleteAccount(): Promise<void> {
    await apiClient.delete("/users/me");
  },

  async uploadAvatar(file: File): Promise<void> {
    const form = new FormData();
    form.append("file", file);
    await apiClient.put("/users/me/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  avatarUrl(userId: string): string {
    // cache-busting через query, чтобы свежезагруженная аватарка не бралась из кэша браузера
    return buildAssetUrl(`/users/${userId}/avatar?t=${Date.now()}`);
  },

  async findByLogin(login: string): Promise<AuthUser[]> {
    const { data } = await apiClient.get<AuthUser[]>("/users", { params: { login } });
    return data;
  },
};
