import { useMemo, useState } from "react";
import { AutoComplete, Input, Select, Button, message } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import { authApi } from "../../api/auth";
import { normalizeApiError } from "../../api/client";
import { useWorkspacesStore } from "../../store/workspacesStore";
import type { AuthUser, WorkspaceRole } from "../../api/types";

const ROLE_OPTIONS: { value: WorkspaceRole; label: string }[] = [
  { value: "EDITOR", label: "Editor — ведёт задачи" },
  { value: "EXECUTOR", label: "Executor — исполнитель" },
  { value: "OBSERVER", label: "Observer — только просмотр" },
  { value: "ADMIN", label: "Admin — полный доступ" },
];

const SEARCH_DEBOUNCE_MS = 350;

interface Props {
  workspaceId: string;
  existingMemberIds: string[];
}

export function MemberSearchAdder({ workspaceId, existingMemberIds }: Props) {
  const addMember = useWorkspacesStore((s) => s.addMember);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<AuthUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<WorkspaceRole>("EDITOR");
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);

  const timer = useMemo(() => ({ current: null as ReturnType<typeof setTimeout> | null }), []);

  const runSearch = (value: string) => {
    setQuery(value);
    setSelectedUser(null);
    if (timer.current) clearTimeout(timer.current);

    if (!value.trim()) {
      setOptions([]);
      return;
    }

    timer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const users = await authApi.findByLogin(value.trim());
        setOptions(users.filter((u) => !existingMemberIds.includes(u.id)));
      } catch {
        setOptions([]);
      } finally {
        setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleAdd = async () => {
    if (!selectedUser) return;
    setAdding(true);
    try {
      await addMember(workspaceId, { userId: selectedUser.id, role });
      message.success(`${selectedUser.login} добавлен(а) в пространство`);
      setQuery("");
      setOptions([]);
      setSelectedUser(null);
    } catch (e) {
      message.error(normalizeApiError(e).message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <AutoComplete
        style={{ flex: "1 1 200px" }}
        value={query}
        onSearch={runSearch}
        onSelect={(_, option) =>
          setSelectedUser(options.find((u) => u.id === option.key) ?? null)
        }
        options={options.map((u) => ({ key: u.id, value: u.login, label: u.login }))}
        notFoundContent={searching ? "Ищем…" : query ? "Никого не найдено" : null}
      >
        <Input placeholder="Поиск по логину" size="large" />
      </AutoComplete>

      <Select
        value={role}
        onChange={setRole}
        options={ROLE_OPTIONS}
        style={{ width: 200 }}
        size="large"
      />

      <Button
        type="primary"
        icon={<UserAddOutlined />}
        size="large"
        disabled={!selectedUser}
        loading={adding}
        onClick={handleAdd}
      >
        Добавить
      </Button>
    </div>
  );
}
