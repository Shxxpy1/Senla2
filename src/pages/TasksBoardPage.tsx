import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Typography, Skeleton, Alert, Result } from "antd";
import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import { AppShell } from "../components/layout/AppShell";
import { KanbanColumn } from "../components/tasks/KanbanColumn";
import { CreateTaskModal } from "../components/tasks/CreateTaskModal";
import { TaskDetailDrawer } from "../components/tasks/TaskDetailDrawer";
import { useWorkspacesStore } from "../store/workspacesStore";
import { useTasksStore } from "../store/tasksStore";
import { useAuthStore } from "../store/authStore";
import { getMyRole, getTaskPermissions } from "../utils/permissions";
import { STATUS_ORDER } from "../utils/taskMeta";
import { normalizeApiError } from "../api/client";
import { message } from "antd";
import type { Task, TaskStatus } from "../api/types";

export function TasksBoardPage() {
  const { workspaceId = "" } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const workspaces = useWorkspacesStore((s) => s.items);
  const workspacesLoading = useWorkspacesStore((s) => s.loading);
  const fetchWorkspaces = useWorkspacesStore((s) => s.fetch);

  const tasks = useTasksStore((s) => s.items);
  const tasksLoading = useTasksStore((s) => s.loading);
  const tasksError = useTasksStore((s) => s.error);
  const fetchTasks = useTasksStore((s) => s.fetch);
  const moveStatus = useTasksStore((s) => s.moveStatus);

  const [createOpen, setCreateOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    if (workspaces.length === 0) fetchWorkspaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (workspaceId) fetchTasks(workspaceId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const workspace = workspaces.find((w) => w.id === workspaceId) ?? null;
  const members = workspace?.members ?? [];
  const memberByUserId = useMemo(() => new Map(members.map((m) => [m.userId, m])), [members]);

  const myRole = getMyRole(workspace, user?.id);
  const permissions = getTaskPermissions(myRole);

  const handleDrop = async (taskId: string, status: TaskStatus) => {
    try {
      await moveStatus(taskId, status);
    } catch (e) {
      message.error(normalizeApiError(e).message);
    }
  };

  if (workspacesLoading && !workspace) {
    return (
      <AppShell>
        <Skeleton active paragraph={{ rows: 6 }} />
      </AppShell>
    );
  }

  if (!workspace) {
    return (
      <AppShell>
        <Result
          status="404"
          title="Пространство не найдено"
          subTitle="Возможно, его удалили или у вас нет доступа."
          extra={
            <Button type="primary" onClick={() => navigate("/workspaces")}>
              К списку пространств
            </Button>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Button
              shape="circle"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/workspaces")}
            />
            <div>
              <Typography.Title level={3} className="heading-font" style={{ color: "#EDF1FA", margin: 0 }}>
                {workspace.name}
              </Typography.Title>
              <Typography.Text style={{ color: "#93A0C2" }}>
                {workspace.code} · задачи получают номера {workspace.code}-1, {workspace.code}-2…
              </Typography.Text>
            </div>
          </div>

          {permissions.canCreate && (
            <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setCreateOpen(true)}>
              Новая задача
            </Button>
          )}
        </div>

        {tasksError && <Alert type="error" message={tasksError} showIcon />}

        {tasksLoading && tasks.length === 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {STATUS_ORDER.map((s) => (
              <Skeleton key={s} active paragraph={{ rows: 4 }} />
            ))}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {STATUS_ORDER.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={tasks.filter((t) => t.status === status)}
                memberByUserId={memberByUserId}
                canDrop={permissions.canDrag}
                onDropTask={handleDrop}
                onTaskDragStart={() => {}}
                onTaskClick={setActiveTask}
              />
            ))}
          </div>
        )}
      </div>

      <CreateTaskModal
        open={createOpen}
        workspaceId={workspaceId}
        members={members}
        onClose={() => setCreateOpen(false)}
      />
      <TaskDetailDrawer
        task={activeTask}
        members={members}
        permissions={permissions}
        myRole={myRole}
        onClose={() => setActiveTask(null)}
      />
    </AppShell>
  );
}
