import { useState } from "react";
import { Form, Input, Button, Typography, Alert } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/layout/AuthLayout";
import { useAuthStore } from "../store/authStore";
import type { AuthCredentials } from "../api/types";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: AuthCredentials) => {
    setSubmitting(true);
    setError(null);
    try {
      await login(values);
      navigate("/workspaces");
    } catch (e) {
      setError((e as { message?: string }).message ?? "Не получилось войти");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="С возвращением"
      subtitle="Войдите, чтобы видеть свои пространства, задачи и активные сессии."
    >
      <Typography.Title level={3} className="heading-font" style={{ color: "#EDF1FA", marginTop: 0 }}>
        Вход
      </Typography.Title>

      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item
          name="login"
          label="Логин"
          rules={[{ required: true, message: "Введите логин" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="ivan_petrov" size="large" autoFocus />
        </Form.Item>

        <Form.Item
          name="password"
          label="Пароль"
          rules={[{ required: true, message: "Введите пароль" }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
        </Form.Item>

        <Button type="primary" htmlType="submit" block size="large" loading={submitting}>
          Войти
        </Button>
      </Form>

      <div style={{ textAlign: "center", marginTop: 18, color: "#93A0C2" }}>
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </div>
    </AuthLayout>
  );
}
