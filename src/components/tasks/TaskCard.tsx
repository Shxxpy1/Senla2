import { Tag, Avatar, Tooltip } from "antd";
import { UserOutlined, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { PRIORITY_META } from "../../utils/taskMeta";
import type { Task, WorkspaceMember } from "../../api/types";

interface Props {
  task: Task;
  assignee?: WorkspaceMember;
  draggable: boolean;
  onDragStart: (taskId: string) => void;
  onClick: () => void;
}

export function TaskCard({ task, assignee, draggable, onDragStart, onClick }: Props) {
  const priority = PRIORITY_META[task.priority];
  const isOverdue =
    task.dueDate && task.status !== "DONE" && dayjs(task.dueDate).isBefore(dayjs(), "day");

  return (
    <div
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", task.id);
        onDragStart(task.id);
      }}
      onClick={onClick}
      className="fade-rise"
      style={{
        background: "#1E2A47",
        border: "1px solid #28365A",
        borderRadius: 14,
        padding: "12px 14px",
        cursor: draggable ? "grab" : "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            color: "#6C8CFF",
            fontWeight: 700,
            fontSize: 12.5,
            letterSpacing: 0.3,
          }}
        >
          {task.jiraCode}
        </span>
        <Tag color={priority.color} style={{ margin: 0, color: "#0B1220", fontWeight: 600 }}>
          {priority.label}
        </Tag>
      </div>

      <div style={{ color: "#EDF1FA", fontSize: 14, lineHeight: 1.4 }}>{task.title}</div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Tooltip title={assignee?.login ?? "Не назначен"}>
          <Avatar size={22} icon={<UserOutlined />} style={{ background: "#28365A" }}>
            {assignee?.login?.[0]?.toUpperCase()}
          </Avatar>
        </Tooltip>

        {task.dueDate && (
          <span
            style={{
              fontSize: 12,
              color: isOverdue ? "#FF6B6B" : "#93A0C2",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <ClockCircleOutlined /> {dayjs(task.dueDate).format("D MMM")}
          </span>
        )}
      </div>
    </div>
  );
}
