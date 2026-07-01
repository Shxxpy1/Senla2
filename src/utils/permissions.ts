import type { Workspace, WorkspaceRole } from "../api/types";

/**
 * Возвращает роль текущего пользователя в пространстве, или null, если
 * бэкенд не прислал members в ответе (тогда фронт не блокирует UI —
 * сервер всё равно проверит права и вернёт 403 при необходимости).
 */
export function getMyRole(workspace: Workspace | null, userId?: string): WorkspaceRole | null {
  if (!workspace || !userId) return null;
  return workspace.members?.find((m) => m.userId === userId)?.role ?? null;
}

export interface TaskPermissions {
  /** Может создавать/удалять задачи и менять любые поля. */
  canEditAllFields: boolean;
  /** Может менять только статус (перетаскивать по доске). */
  canChangeStatusOnly: boolean;
  /** Может перетаскивать карточки вообще (включает canEditAllFields). */
  canDrag: boolean;
  /** Может создавать новые задачи. */
  canCreate: boolean;
  /** Может удалить задачу. */
  canDelete: boolean;
}

export function getTaskPermissions(role: WorkspaceRole | null): TaskPermissions {
  // Роль неизвестна (бэкенд не отдал members) — не запрещаем на фронте,
  // финальное решение в любом случае за сервером.
  if (role === null) {
    return {
      canEditAllFields: true,
      canChangeStatusOnly: false,
      canDrag: true,
      canCreate: true,
      canDelete: true,
    };
  }

  switch (role) {
    case "ADMIN":
    case "EDITOR":
      return {
        canEditAllFields: true,
        canChangeStatusOnly: false,
        canDrag: true,
        canCreate: true,
        canDelete: true,
      };
    case "EXECUTOR":
      return {
        canEditAllFields: false,
        canChangeStatusOnly: true,
        canDrag: true,
        canCreate: false,
        canDelete: false,
      };
    case "OBSERVER":
    default:
      return {
        canEditAllFields: false,
        canChangeStatusOnly: false,
        canDrag: false,
        canCreate: false,
        canDelete: false,
      };
  }
}
