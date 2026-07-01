import { useState } from "react";
import { Modal, Form, Input, Select, DatePicker, message } from "antd";
import dayjs from "dayjs";
import { useTasksStore } from "../../store/tasksStore";
import { normalizeApiError } from "../../api/client";
import { PRIORITY_ORDER, PRIORITY_META } from "../../utils/taskMeta";
import type { WorkspaceMember } from "../../api/types";

interface FormValues {
  title: string;
  description?: string;
  priority: keyof typeof PRIORITY_META;
  dueDate?: dayjs.Dayjs;
  assigneeId?: string;
}

interface Props {
  open: boolean;
  workspaceId: string;
  members: WorkspaceMember[];
  onClose: () => void;
}

export function CreateTaskModal({ open, workspaceId, members, onClose }: Props) {
  const [form] = Form.useForm<FormValues>();
  const create = useTasksStore((s) => s.create);
  const [submitting, setSubmitting] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await create(workspaceId, {
        title: values.title,
        description: values.description,
        priority: values.priority,
        dueDate: values.dueDate?.toISOString(),
        assigneeId: values.assigneeId,
      });
      message.success("Задача создана");
      form.resetFields();
      onClose();
    } catch (e) {
      if (e && typeof e === "object" && "errorFields" in e) return;
      message.error(normalizeApiError(e).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Новая задача"
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={submitting}
      okText="Создать"
      cancelText="Отмена"
      destroyOnHidden
    >
      <Form layout="vertical" form={form} requiredMark={false} initialValues={{ priority: "MEDIUM" }}>
        <Form.Item
          name="title"
          label="Название"
          rules={[{ required: true, message: "Введите название задачи" }]}
        >
          <Input placeholder="Поправить баг с авторизацией" size="large" autoFocus />
        </Form.Item>

        <Form.Item name="description" label="Описание">
          <Input.TextArea rows={3} placeholder="Детали, шаги воспроизведения, ссылки…" />
        </Form.Item>

        <Form.Item name="priority" label="Приоритет">
          <Select
            size="large"
            options={PRIORITY_ORDER.map((p) => ({ value: p, label: PRIORITY_META[p].label }))}
          />
        </Form.Item>

        <Form.Item name="dueDate" label="Срок">
          <DatePicker size="large" style={{ width: "100%" }} format="D MMM YYYY" />
        </Form.Item>

        <Form.Item name="assigneeId" label="Исполнитель">
          <Select
            size="large"
            allowClear
            placeholder="Не назначен"
            options={members.map((m) => ({ value: m.userId, label: m.login ?? m.userId }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
