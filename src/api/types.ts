/**
 * Типы основаны на схемах из Swagger (AuthDto, CreateWorkspaceDto и т.д.).
 * Для сущностей, чьи схемы ответов не были описаны в документации
 * (User, Session), поля помечены как опциональные / снабжены комментарием
 * "предположение" — если бэкенд отдаёт другие имена полей, поправь здесь,
 * это единственное место, которое нужно будет тронуть.
 */

export type WorkspaceRole = "ADMIN" | "EDITOR" | "EXECUTOR" | "OBSERVER";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface AuthCredentials {
  login: string;
  password: string;
}

/** Предположение: бэкенд возвращает пользователя при /auth/login и /auth/register. */
export interface AuthUser {
  id: string;
  login: string;
  createdAt?: string;
}

/**
 * Предположение по форме записи сессии — в задании прямо описаны поля,
 * которые сервер обязан логировать (IP, девайс/User-Agent, город),
 * остальное — стандартные для такой модели id/даты/признак текущей сессии.
 */
export interface Session {
  id: string;
  ip: string;
  userAgent: string;
  city?: string;
  createdAt: string;
  lastActiveAt?: string;
  isCurrent?: boolean;
}

export interface WorkspaceMember {
  userId: string;
  login?: string;
  role: WorkspaceRole;
}

export interface Workspace {
  id: string;
  name: string;
  code: string;
  isPrivate: boolean;
  members?: WorkspaceMember[];
  myRole?: WorkspaceRole;
}

export interface CreateWorkspacePayload {
  name: string;
  code: string;
  isPrivate?: boolean;
}

export type UpdateWorkspacePayload = Partial<CreateWorkspacePayload>;

export interface AddMemberPayload {
  userId: string;
  role: WorkspaceRole;
}

export interface Task {
  id: string;
  jiraCode: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  assigneeId?: string;
  workspaceId: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  assigneeId?: string;
}

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export interface Comment {
  id: string;
  content: string;
  parentId?: string | null;
  authorId: string;
  authorLogin?: string;
  taskId: string;
  createdAt: string;
  replies?: Comment[];
}

/**
 * Форма realtime-событий не описана в свагере — это разумный конверт
 * "тип события + произвольный payload", который покрывает все кейсы
 * из ТЗ (вход в аккаунт, добавление в пространство, назначение
 * исполнителем, изменение задачи, новый комментарий).
 */
export type UserNotificationType =
  | "SESSION_CREATED"
  | "WORKSPACE_INVITE"
  | "TASK_ASSIGNED"
  | string;

export interface UserNotification {
  type: UserNotificationType;
  message?: string;
  payload?: Record<string, unknown>;
  createdAt?: string;
}

export type TaskNotificationType = "TASK_UPDATED" | "COMMENT_CREATED" | string;

export interface TaskNotification {
  type: TaskNotificationType;
  payload?: Record<string, unknown>;
  createdAt?: string;
}
