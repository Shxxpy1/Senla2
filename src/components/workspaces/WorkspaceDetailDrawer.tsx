import { useEffect, useState } from "react";
import {
  Drawer,
  Form,
  Input,
  Switch,
  Button,
  Typography,
  List,
  Tag,
  Popconfirm,
  message,
  Divider,
  Empty,
} from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useWorkspacesStore } from "../../store/workspacesStore";
import { useAuthStore } from "../../store/authStore";
import { normalizeApiError } from "../../api/client";
import { MemberSearchAdder } from "./MemberSearchAdder";
import type { UpdateWorkspacePayload, Workspace } from "../../api/types";

const ROLE_COLOR: Record<string, string> = {
  ADMIN: "gold",
  EDITOR: "blue",
  EXECUTOR: "cyan",
  OBSERVER: "default",
};

interface Props {
  workspace: Workspace | null;
  onClose: () => void;
}

export function WorkspaceDetailDrawer({ workspace, onClose }: Props) {
  const user = useAuthStore((s) => s.user);
  const update = useWorkspacesStore((s) => s.update);
  const remove = useWorkspacesStore((s) => s.remove);
  const removeMember = useWorkspacesStore((s) => s.removeMember);
  const [form] = Form.useForm<UpdateWorkspacePayload>();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (workspace) {
      form.setFieldsValue({
        name: workspace.name,
        code: workspace.code,
        isPrivate: workspace.isPrivate,
      });
    }
  }, [workspace, form]);

  if (!workspace) return null;

  const myMembership = workspace.members?.find((m) => m.userId === user?.id);
  // Если бэкенд не вернул members — не блокируем управление, сервер сам проверит права.
  const canManage = !myMembership || myMembership.role === "ADMIN";

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await update(workspace.id, { ...values, code: values.code?.toUpperCase() });
      message.success("Изменения сохранены");
    } catch (e) {
      if (e && typeof e === "object" && "errorFields" in e) return;
      message.error(normalizeApiError(e).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await remove(workspace.id);
      message.success("Пространство удалено");
      onClose();
    } catch (e) {
      message.error(normalizeApiError(e).message);
    } finally {
      setDeleting(false);
    }
  };

  const handleRemoveMember = async (userId: string, login?: string) => {
    try {
      await removeMember(workspace.id, userId);
      message.success(`${login ?? "Участник"} удалён из пространства`);
    } catch (e) {
      message.error(normalizeApiError(e).message);
    }
  };

  return (
    <Drawer
      open={!!workspace}
      onClose={onClose}
      width={460}
      title={
        <span className="heading-font" style={{ color: "#EDF1FA" }}>
          {workspace.name}
        </span>
      }
    >
      <Form layout="vertical" form={form} requiredMark={false} disabled={!canManage}>
        <Form.Item name="name" label="Название" rules={[{ required: true, message: "Введите название" }]}>
          <Input size="large" />
        </Form.Item>
        <Form.Item
          name="code"
          label="Код"
          rules={[{ pattern: /^[A-Za-z]{2,6}$/, message: "2–6 латинских букв" }]}
        >
          <Input size="large" />
        </Form.Item>
        <Form.Item name="isPrivate" label="Приватное пространство" valuePropName="checked">
          <Switch disabled={workspace.isPrivate} />
        </Form.Item>
      </Form>

      {canManage && (
        <Button type="primary" onClick={handleSave} loading={saving} style={{ marginBottom: 8 }}>
          Сохранить
        </Button>
      )}

      <Divider />

      <Typography.Title level={5} className="heading-font" style={{ color: "#EDF1FA" }}>
        Участники
      </Typography.Title>

      {workspace.isPrivate ? (
        <Typography.Text style={{ color: "#93A0C2" }}>
          <LockOutlined /> Личное пространство — добавление участников недоступно.
        </Typography.Text>
      ) : (
        <>
          {canManage && (
            <div style={{ marginBottom: 14 }}>
              <MemberSearchAdder
                workspaceId={workspace.id}
                existingMemberIds={(workspace.members ?? []).map((m) => m.userId)}
              />
            </div>
          )}

          {!workspace.members || workspace.members.length === 0 ? (
            <Empty description="Пока нет участников" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <List
              dataSource={workspace.members}
              renderItem={(member) => (
                <List.Item
                  key={member.userId}
                  style={{
                    background: "#1E2A47",
                    border: "1px solid #28365A",
                    borderRadius: 12,
                    padding: "10px 14px",
                    marginBottom: 8,
                  }}
                  actions={
                    canManage && member.userId !== user?.id
                      ? [
                          <Popconfirm
                            key="remove"
                            title="Удалить участника?"
                            okText="Удалить"
                            cancelText="Отмена"
                            onConfirm={() => handleRemoveMember(member.userId, member.login)}
                          >
                            <Button danger size="small" type="text">
                              Удалить
                            </Button>
                          </Popconfirm>,
                        ]
                      : undefined
                  }
                >
                  <List.Item.Meta
                    avatar={<UserOutlined style={{ color: "#6C8CFF" }} />}
                    title={
                      <span style={{ color: "#EDF1FA" }}>
                        {member.login ?? member.userId}{" "}
                        {member.userId === user?.id && (
                          <Tag color="default" style={{ marginLeft: 6 }}>
                            Вы
                          </Tag>
                        )}
                      </span>
                    }
                    description={
                      <Tag color={ROLE_COLOR[member.role] ?? "default"}>{member.role}</Tag>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </>
      )}

      {!workspace.isPrivate && canManage && (
        <>
          <Divider />
          <Typography.Title level={5} className="heading-font" style={{ color: "#FF6B6B" }}>
            Опасная зона
          </Typography.Title>
          <Popconfirm
            title="Удалить пространство навсегда?"
            description="Все задачи и комментарии внутри будут потеряны."
            okText="Удалить"
            cancelText="Отмена"
            onConfirm={handleDelete}
          >
            <Button danger loading={deleting}>
              Удалить пространство
            </Button>
          </Popconfirm>
        </>
      )}
    </Drawer>
  );
}
