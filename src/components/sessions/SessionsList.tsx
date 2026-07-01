import { useEffect } from "react";
import { List, Tag, Button, Empty, Skeleton, message, Popconfirm } from "antd";
import { LaptopOutlined, EnvironmentOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { UAParser } from "ua-parser-js";
import { useAuthStore } from "../../store/authStore";

function describeUserAgent(ua: string): string {
  const parser = new UAParser(ua);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const browserPart = browser.name ? `${browser.name} ${browser.version?.split(".")[0] ?? ""}` : null;
  const osPart = os.name ? `${os.name} ${os.version ?? ""}`.trim() : null;
  return [browserPart, osPart].filter(Boolean).join(" · ") || ua;
}

export function SessionsList() {
  const sessions = useAuthStore((s) => s.sessions);
  const loading = useAuthStore((s) => s.sessionsLoading);
  const fetchSessions = useAuthStore((s) => s.fetchSessions);
  const revokeSession = useAuthStore((s) => s.revokeSession);

  useEffect(() => {
    fetchSessions().catch(() => message.error("Не удалось загрузить список сессий"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRevoke = async (id: string) => {
    try {
      await revokeSession(id);
      message.success("Сессия завершена");
    } catch {
      message.error("Не удалось завершить сессию");
    }
  };

  if (loading && sessions.length === 0) {
    return <Skeleton active paragraph={{ rows: 3 }} />;
  }

  if (!loading && sessions.length === 0) {
    return <Empty description="Активных сессий не найдено" />;
  }

  return (
    <List
      dataSource={sessions}
      renderItem={(session) => (
        <List.Item
          key={session.id}
          className="fade-rise"
          style={{
            background: "#1E2A47",
            border: "1px solid #28365A",
            borderRadius: 14,
            padding: "16px 18px",
            marginBottom: 10,
          }}
          actions={[
            session.isCurrent ? (
              <Tag color="success" key="current">
                Текущая
              </Tag>
            ) : (
              <Popconfirm
                key="revoke"
                title="Завершить эту сессию?"
                okText="Завершить"
                cancelText="Отмена"
                onConfirm={() => handleRevoke(session.id)}
              >
                <Button danger size="small">
                  Завершить
                </Button>
              </Popconfirm>
            ),
          ]}
        >
          <List.Item.Meta
            avatar={<LaptopOutlined style={{ fontSize: 20, color: "#6C8CFF" }} />}
            title={
              <span style={{ color: "#EDF1FA" }}>{describeUserAgent(session.userAgent)}</span>
            }
            description={
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ color: "#93A0C2", fontSize: 13 }}>
                  <EnvironmentOutlined /> {session.city ?? "Город не определён"} ·{" "}
                  {session.ip}
                </span>
                <span style={{ color: "#93A0C2", fontSize: 12.5 }}>
                  Вход: {dayjs(session.createdAt).format("D MMM YYYY, HH:mm")}
                </span>
              </div>
            }
          />
        </List.Item>
      )}
    />
  );
}
