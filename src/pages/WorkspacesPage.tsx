import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Skeleton, Empty, Input, Alert } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { AppShell } from "../components/layout/AppShell";
import { CreateWorkspaceModal } from "../components/workspaces/CreateWorkspaceModal";
import { WorkspaceCard } from "../components/workspaces/WorkspaceCard";
import { WorkspaceDetailDrawer } from "../components/workspaces/WorkspaceDetailDrawer";
import { useWorkspacesStore } from "../store/workspacesStore";
import { useAuthStore } from "../store/authStore";
import type { Workspace } from "../api/types";

export function WorkspacesPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const items = useWorkspacesStore((s) => s.items);
  const loading = useWorkspacesStore((s) => s.loading);
  const error = useWorkspacesStore((s) => s.error);
  const fetch = useWorkspacesStore((s) => s.fetch);

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected: Workspace | null = items.find((w) => w.id === selectedId) ?? null;

  const filtered = items.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AppShell>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <Typography.Title level={3} className="heading-font" style={{ color: "#EDF1FA", margin: 0 }}>
              Пространства
            </Typography.Title>
            <Typography.Text style={{ color: "#93A0C2" }}>
              Личное пространство создаётся автоматически, остальные — для командной работы
            </Typography.Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setCreateOpen(true)}>
            Новое пространство
          </Button>
        </div>

        {error && <Alert type="error" message={error} showIcon />}

        <Input
          prefix={<SearchOutlined style={{ color: "#93A0C2" }} />}
          placeholder="Поиск по названию или коду"
          size="large"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
          allowClear
        />

        {loading && items.length === 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} active paragraph={{ rows: 2 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Empty description={search ? "Ничего не найдено" : "Пространств пока нет"} />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {filtered.map((w) => {
              const myRole = w.members?.find((m) => m.userId === user?.id)?.role ?? null;
              return (
                <WorkspaceCard
                  key={w.id}
                  workspace={w}
                  myRole={myRole}
                  onClick={() => navigate(`/workspaces/${w.id}`)}
                  onSettingsClick={() => setSelectedId(w.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      <CreateWorkspaceModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <WorkspaceDetailDrawer workspace={selected} onClose={() => setSelectedId(null)} />
    </AppShell>
  );
}
