import { useEffect, useRef } from "react";
import { notification } from "antd";
import { API_URL } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useNotificationsStore } from "../store/notificationsStore";
import { useWorkspacesStore } from "../store/workspacesStore";
import { useTasksStore } from "../store/tasksStore";
import type { UserNotification } from "../api/types";

const RECONNECT_DELAY_MS = 4000;

function parseEvent(raw: string): UserNotification | null {
  try {
    return JSON.parse(raw) as UserNotification;
  } catch {
    // Бэкенд может присылать просто текст — заворачиваем в минимальный конверт.
    return { type: "MESSAGE", message: raw };
  }
}

function describe(n: UserNotification): { title: string; description?: string } {
  switch (n.type) {
    case "SESSION_CREATED":
      return {
        title: "Новый вход в аккаунт",
        description: n.message ?? "Кто-то (или вы) вошли в аккаунт с нового устройства.",
      };
    case "WORKSPACE_INVITE":
      return {
        title: "Новое пространство",
        description: n.message ?? "Вас добавили в командное пространство.",
      };
    case "TASK_ASSIGNED":
      return {
        title: "Назначена задача",
        description: n.message ?? "Вас назначили исполнителем задачи.",
      };
    default:
      return { title: "Уведомление", description: n.message };
  }
}

/**
 * Держит постоянное SSE-соединение с /notifications/user, пока пользователь
 * аутентифицирован. При обрыве — переподключается. Канал задач
 * (/notifications/task/:id) живёт отдельно, в контексте конкретной задачи.
 */
export function useUserNotifications() {
  const status = useAuthStore((s) => s.status);
  const notifySessionCreated = useAuthStore((s) => s.notifySessionCreated);
  const pushFeed = useNotificationsStore((s) => s.push);
  const fetchWorkspaces = useWorkspacesStore((s) => s.fetch);
  const currentBoardWorkspaceId = useTasksStore((s) => s.workspaceId);
  const fetchTasks = useTasksStore((s) => s.fetch);
  const sourceRef = useRef<EventSource | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status !== "authenticated") {
      sourceRef.current?.close();
      sourceRef.current = null;
      return;
    }

    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      const source = new EventSource(`${API_URL}/notifications/user`, {
        withCredentials: true,
      });
      sourceRef.current = source;

      source.onmessage = (event) => {
        const parsed = parseEvent(event.data);
        if (!parsed) return;

        if (parsed.type === "SESSION_CREATED") {
          notifySessionCreated();
        }
        if (parsed.type === "WORKSPACE_INVITE") {
          void fetchWorkspaces();
        }
        if (parsed.type === "TASK_ASSIGNED" && currentBoardWorkspaceId) {
          void fetchTasks(currentBoardWorkspaceId);
        }
        pushFeed(parsed);

        const { title, description } = describe(parsed);
        notification.open({
          message: title,
          description,
          placement: "bottomRight",
        });
      };

      source.onerror = () => {
        source.close();
        if (!cancelled) {
          reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };
    };

    connect();

    return () => {
      cancelled = true;
      sourceRef.current?.close();
      sourceRef.current = null;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [status, notifySessionCreated, pushFeed, fetchWorkspaces, currentBoardWorkspaceId, fetchTasks]);
}
