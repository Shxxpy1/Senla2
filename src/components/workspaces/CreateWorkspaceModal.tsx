import { useState } from "react";
import { Modal, Form, Input, Switch, message } from "antd";
import { useWorkspacesStore } from "../../store/workspacesStore";
import { normalizeApiError } from "../../api/client";
import type { CreateWorkspacePayload } from "../../api/types";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateWorkspaceModal({ open, onClose }: Props) {
  const [form] = Form.useForm<CreateWorkspacePayload>();
  const create = useWorkspacesStore((s) => s.create);
  const [submitting, setSubmitting] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await create({ ...values, code: values.code.toUpperCase() });
      message.success("Пространство создано");
      form.resetFields();
      onClose();
    } catch (e) {
      if (e && typeof e === "object" && "errorFields" in e) return; // ошибка валидации формы
      message.error(normalizeApiError(e).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Новое пространство"
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={submitting}
      okText="Создать"
      cancelText="Отмена"
    >
      <Form layout="vertical" form={form} requiredMark={false} initialValues={{ isPrivate: false }}>
        <Form.Item
          name="name"
          label="Название"
          rules={[{ required: true, message: "Введите название" }]}
        >
          <Input placeholder="Веб-платформа" size="large" autoFocus />
        </Form.Item>

        <Form.Item
          name="code"
          label="Короткий код"
          tooltip="Используется в номерах задач, например WEB-1, WEB-2"
          rules={[
            { required: true, message: "Введите код" },
            { pattern: /^[A-Za-z]{2,6}$/, message: "2–6 латинских букв, например WEB" },
          ]}
        >
          <Input placeholder="WEB" size="large" style={{ textTransform: "uppercase" }} />
        </Form.Item>

        <Form.Item name="isPrivate" label="Приватное пространство" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
