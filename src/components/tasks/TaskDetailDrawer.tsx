import { useEffect, useState } from "react";
import { Drawer, Form, Input, Select, DatePicker, Button, Popconfirm, message, Typography, Tag } from "antd";
import dayjs from "dayjs";
import { useTasksStore } from "../../store/tasksStore";
import { normalizeApiError } from "../../api/client";
import { PRIORITY_ORDER, PRIORITY_META, STATUS_ORDER, STATUS_META } from "../../utils/taskMeta";
import { CommentThread } from "../comments/CommentThread";
import type { TaskPermissions } from "../../utils/permissions";
import type { Task, WorkspaceMember, WorkspaceRole } from "../../api/types";

interface FormValues {
  title: string;
  description?: string;
  priority: Task["priority"];
  status: Task["status"];
  dueDate?: dayjs.Dayjs;
  assigneeId?: string;
}

interface Props {
  task: Task | null;
  members: WorkspaceMember[];
  permissions: TaskPermissions;
  myRole: WorkspaceRole | null;
  onClose: () => void;
}

export function TaskDetailDrawer({ task, members, permissions, myRole, onClose }: Props) {
  const [form] = Form.useForm<FormValues>();
  const update = useTasksStore((s) => s.update);
  const remove = useTasksStore((s) => s.remove);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (task) {
      form.setFieldsValue({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? dayjs(task.dueDate) : undefined,
        assigneeId: task.assigneeId,
      });
    }
  }, [task, form]);

  if (!task) return null;

  const readOnly = !permissions.canEditAllFields && !permissions.canChangeStatusOnly;

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload = permissions.canEditAllFields
        ? {
            title: values.title,
            description: values.description,
            priority: values.priority,
            status: values.status,
            dueDate: values.dueDate?.toISOString(),
            assigneeId: values.assigneeId,
          }
        : { status: values.status }; // EXECUTOR — только статус, остальное сервер всё равно отклонит

      await update(task.id, payload);
      message.success("Задача обновлена");
      onClose();
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
      await remove(task.id);
      message.success("Задача удалена");
      onClose();
    } catch (e) {
      message.error(normalizeApiError(e).message);
    } finally {
      setDeleting(false);
    }
  };

  const fieldsDisabled = !permissions.canEditAllFields;

  return (
    <Drawer
      open={!!task}
      onClose={onClose}
      width={560}
      title={
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#6C8CFF", fontWeight: 700 }}>{task.jiraCode}</span>
          {readOnly && <Tag color="default">Только просмотр</Tag>}
        </span>
      }
    >
      <Form layout="vertical" form={form} requiredMark={false}>
        <Form.Item
          name="title"
          label="Название"
          rules={[{ required: true, message: "Введите название" }]}
        >
          <Input size="large" disabled={fieldsDisabled} />
        </Form.Item>

        <Form.Item name="description" label="Описание">
          <Input.TextArea rows={4} disabled={fieldsDisabled} />
        </Form.Item>

        <Form.Item name="priority" label="Приоритет">
          <Select
            size="large"
            disabled={fieldsDisabled}
            options={PRIORITY_ORDER.map((p) => ({ value: p, label: PRIORITY_META[p].label }))}
          />
        </Form.Item>

        <Form.Item name="status" label="Статус">
          <Select
            size="large"
            disabled={readOnly}
            options={STATUS_ORDER.map((s) => ({ value: s, label: STATUS_META[s].label }))}
          />
        </Form.Item>

        <Form.Item name="dueDate" label="Срок">
          <DatePicker size="large" style={{ width: "100%" }} format="D MMM YYYY" disabled={fieldsDisabled} />
        </Form.Item>

        <Form.Item name="assigneeId" label="Исполнитель">
          <Select
            size="large"
            allowClear
            disabled={fieldsDisabled}
            placeholder="Не назначен"
            options={members.map((m) => ({ value: m.userId, label: m.login ?? m.userId }))}
          />
        </Form.Item>
      </Form>

      {!readOnly && (
        <Button type="primary" onClick={handleSave} loading={saving} style={{ marginBottom: 10 }}>
          Сохранить
        </Button>
      )}

      {permissions.canDelete && (
        <div style={{ marginTop: 8 }}>
          <Typography.Text style={{ color: "#93A0C2", display: "block", marginBottom: 8 }}>
            Удаление задачи нельзя отменить. Jira-номер ({task.jiraCode}) после удаления не
            переиспользуется.
          </Typography.Text>
          <Popconfirm
            title="Удалить задачу?"
            okText="Удалить"
            cancelText="Отмена"
            onConfirm={handleDelete}
          >
            <Button danger loading={deleting}>
              Удалить задачу
            </Button>
          </Popconfirm>
        </div>
      )}

      <CommentThread taskId={task.id} myRole={myRole} />
    </Drawer>
  );
}
