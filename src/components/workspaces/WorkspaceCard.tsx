import { Tag, Button } from "antd";
import { LockOutlined, TeamOutlined, SettingOutlined } from "@ant-design/icons";
import type { Workspace } from "../../api/types";

const ACCENTS = ["#6C8CFF", "#FFB86B", "#4ADE80", "#FF8FB1", "#7FE3D6", "#C49CFF"];

function accentFor(code: string): string {
  const sum = code.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return ACCENTS[sum % ACCENTS.length];
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  EDITOR: "Editor",
  EXECUTOR: "Executor",
  OBSERVER: "Observer",
};

interface Props {
  workspace: Workspace;
  myRole: string | null;
  onClick: () => void;
  onSettingsClick: () => void;
}

export function WorkspaceCard({ workspace, myRole, onClick, onSettingsClick }: Props) {
  const accent = accentFor(workspace.code || workspace.name);

  return (
    <div
      onClick={onClick}
      className="fade-rise"
      style={{
        background: "#161F36",
        border: "1px solid #28365A",
        borderRadius: 16,
        padding: "18px 20px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        transition: "border-color 0.2s ease, transform 0.2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = accent)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#28365A")}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `linear-gradient(155deg, ${accent}, ${accent}99)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0B1220",
            fontWeight: 800,
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          {workspace.code || "?"}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            className="heading-font"
            style={{
              color: "#EDF1FA",
              fontWeight: 600,
              fontSize: 15,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {workspace.name}
          </div>
          <div style={{ color: "#93A0C2", fontSize: 12.5 }}>{workspace.code}</div>
        </div>
        <Button
          type="text"
          shape="circle"
          icon={<SettingOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onSettingsClick();
          }}
        />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {workspace.isPrivate && (
          <Tag icon={<LockOutlined />} color="default">
            Личное
          </Tag>
        )}
        {myRole && <Tag color="blue">{ROLE_LABEL[myRole] ?? myRole}</Tag>}
        <Tag icon={<TeamOutlined />} color="default">
          {(workspace.members?.length ?? 0) + (workspace.isPrivate ? 1 : 0)} участ.
        </Tag>
      </div>

      <div style={{ color: "#6C8CFF", fontSize: 12.5, fontWeight: 600 }}>Открыть задачи →</div>
    </div>
  );
}
