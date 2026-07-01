import { useEffect, useRef } from "react";
import { API_URL } from "../api/client";
import type { TaskNotification } from "../api/types";

/**
 * Подписка на /notifications/task/:id — события по конкретной задаче
 * (новые/обновлённые комментарии, смена статуса).
 *
 * onEvent стабилизируется через ref — соединение пересоздаётся только
 * при смене taskId, а не при каждом рендере компонента.
 */
export function useTaskNotifications(
  taskId: string | null,
  onEvent: (n: TaskNotification) => void,
) {
  const onEventRef = useRef(onEvent);
  useEffect(() => {
    onEventRef.current = onEvent;
  });

  useEffect(() => {
    if (!taskId) return;

    const source = new EventSource(`${API_URL}/notifications/task/${taskId}`, {
      withCredentials: true,
    });

    source.onmessage = (event) => {
      try {
        onEventRef.current(JSON.parse(event.data) as TaskNotification);
      } catch {
        onEventRef.current({ type: "MESSAGE", payload: { raw: event.data } });
      }
    };

    return () => source.close();
  }, [taskId]);
}
