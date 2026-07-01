import { useState } from "react";
import { Card, Typography, Divider, Button, Modal, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { AvatarUploader } from "../components/avatar/AvatarUploader";
import { SessionsList } from "../components/sessions/SessionsList";
import { useAuthStore } from "../store/authStore";

export function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      message.success("Аккаунт удалён");
      navigate("/login");
    } catch {
      message.error("Не получилось удалить аккаунт");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <AppShell>
      <div style={{ maxWidth: 760, display: "flex", flexDirection: "column", gap: 20 }}>
        <Card className="fade-rise">
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <AvatarUploader />
            <div>
              <Typography.Title level={4} className="heading-font" style={{ margin: 0, color: "#EDF1FA" }}>
                {user?.login ?? "—"}
              </Typography.Title>
              <Typography.Text style={{ color: "#93A0C2" }}>
                Нажмите на аватарку, чтобы загрузить новую (PNG/JPEG/WEBP, до 5 МБ)
              </Typography.Text>
            </div>
          </div>
        </Card>

        <Card className="fade-rise" style={{ animationDelay: "0.05s" }}>
          <Typography.Title level={5} className="heading-font" style={{ marginTop: 0, color: "#EDF1FA" }}>
            Активные сессии
          </Typography.Title>
          <Typography.Text style={{ color: "#93A0C2", display: "block", marginBottom: 16 }}>
            Все устройства, с которых выполнен вход в аккаунт. Незнакомую сессию можно завершить.
          </Typography.Text>
          <SessionsList />
        </Card>

        <Card
          className="fade-rise"
          style={{ animationDelay: "0.1s", borderColor: "#3A2230" }}
        >
          <Typography.Title level={5} className="heading-font" style={{ marginTop: 0, color: "#FF6B6B" }}>
            Опасная зона
          </Typography.Title>
          <Typography.Text style={{ color: "#93A0C2", display: "block", marginBottom: 16 }}>
            Удаление аккаунта необратимо: пропадёт доступ ко всем пространствам и задачам.
          </Typography.Text>
          <Button danger onClick={() => setConfirmOpen(true)}>
            Удалить аккаунт
          </Button>
        </Card>

        <Modal
          open={confirmOpen}
          title="Удалить аккаунт навсегда?"
          onCancel={() => setConfirmOpen(false)}
          footer={null}
        >
          <Typography.Paragraph style={{ color: "#93A0C2" }}>
            Это действие нельзя отменить. Чтобы подтвердить, введите свой логин{" "}
            <strong style={{ color: "#EDF1FA" }}>{user?.login}</strong> ниже.
          </Typography.Paragraph>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={user?.login}
          />
          <Divider />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button onClick={() => setConfirmOpen(false)}>Отмена</Button>
            <Button
              danger
              type="primary"
              disabled={confirmText !== user?.login}
              loading={deleting}
              onClick={handleDelete}
            >
              Удалить навсегда
            </Button>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}
