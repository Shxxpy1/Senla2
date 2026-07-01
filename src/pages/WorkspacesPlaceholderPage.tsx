import { Card, Typography, Result, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";

export function WorkspacesPlaceholderPage() {
  const navigate = useNavigate();

  return (
    <AppShell>
      <Card className="fade-rise" style={{ maxWidth: 640 }}>
        <Result
          status="info"
          title={
            <Typography.Title level={4} className="heading-font" style={{ color: "#EDF1FA" }}>
              Пространства и задачи — следующий этап
            </Typography.Title>
          }
          subTitle={
            <Typography.Text style={{ color: "#93A0C2" }}>
              Сейчас готов модуль авторизации, сессий и профиля. Доска пространств,
              задачи с Jira-нумерацией и комментарии подключаются к этой же связке
              api/auth-store/SSE на следующей итерации.
            </Typography.Text>
          }
          extra={
            <Button type="primary" onClick={() => navigate("/profile")}>
              К профилю
            </Button>
          }
        />
      </Card>
    </AppShell>
  );
}
