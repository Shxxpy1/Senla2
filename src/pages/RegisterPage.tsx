import { useState } from "react";
import { Form, Input, Button, Typography, Alert } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/layout/AuthLayout";
import { useAuthStore } from "../store/authStore";

interface RegisterFormValues {
  login: string;
  password: string;
  confirmPassword: string;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const status = useAuthStore((s) => s.status);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: RegisterFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      await register({ login: values.login, password: values.password });
      // Если бэкенд сразу логинит после регистрации — статус станет authenticated
      // и пользователя можно сразу вести в профиль, иначе — на экран входа.
      navigate(status === "authenticated" ? "/workspaces" : "/login");
    } catch (e) {
      setError((e as { message?: string }).message ?? "Не получилось зарегистрироваться");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Создайте аккаунт"
      subtitle="Регистрация занимает минуту. Каждый вход в систему будет логироваться по IP, устройству и городу."
    >
      <Typography.Title level={3} className="heading-font" style={{ color: "#EDF1FA", marginTop: 0 }}>
        Регистрация
      </Typography.Title>

      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item
          name="login"
          label="Логин"
          rules={[
            { required: true, message: "Введите логин" },
            { min: 3, message: "Минимум 3 символа" },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="ivan_petrov" size="large" autoFocus />
        </Form.Item>

        <Form.Item
          name="password"
          label="Пароль"
          rules={[
            { required: true, message: "Введите пароль" },
            { min: 6, message: "Минимум 6 символов" },
          ]}
          hasFeedback
        >
          <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Повторите пароль"
          dependencies={["password"]}
          hasFeedback
          rules={[
            { required: true, message: "Повторите пароль" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Пароли не совпадают"));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
        </Form.Item>

        <Button type="primary" htmlType="submit" block size="large" loading={submitting}>
          Зарегистрироваться
        </Button>
      </Form>

      <div style={{ textAlign: "center", marginTop: 18, color: "#93A0C2" }}>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </div>
    </AuthLayout>
  );
}
