import { useState } from "react";
import { Empty } from "antd";
import { TaskCard } from "./TaskCard";
import { STATUS_META } from "../../utils/taskMeta";
import type { Task, TaskStatus, WorkspaceMember } from "../../api/types";

interface Props {
  status: TaskStatus;
  tasks: Task[];
  memberByUserId: Map<string, WorkspaceMember>;
  canDrop: boolean;
  onDropTask: (taskId: string, status: TaskStatus) => void;
  onTaskDragStart: (taskId: string) => void;
  onTaskClick: (task: Task) => void;
}

export function KanbanColumn({
  status,
  tasks,
  memberByUserId,
  canDrop,
  onDropTask,
  onTaskDragStart,
  onTaskClick,
}: Props) {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        if (!canDrop) return;
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        if (!canDrop) return;
        e.preventDefault();
        setIsOver(false);
        const taskId = e.dataTransfer.getData("text/plain");
        if (taskId) onDropTask(taskId, status);
      }}
      style={{
        background: isOver ? "#1A2540" : "#161F36",
        border: `1px solid ${isOver ? "#6C8CFF" : "#28365A"}`,
        borderRadius: 16,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minHeight: 260,
        transition: "background 0.15s ease, border-color 0.15s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="heading-font" style={{ color: "#EDF1FA", fontWeight: 600, fontSize: 14 }}>
          {STATUS_META[status].label}
        </span>
        <span style={{ color: "#93A0C2", fontSize: 12.5 }}>{tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Пусто" style={{ margin: "20px 0" }} />
      ) : (
        tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            assignee={task.assigneeId ? memberByUserId.get(task.assigneeId) : undefined}
            draggable={canDrop}
            onDragStart={onTaskDragStart}
            onClick={() => onTaskClick(task)}
          />
        ))
      )}
    </div>
  );
}
