import { Badge, Dropdown, Empty, Button } from "antd";
import { BellOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useNotificationsStore } from "../../store/notificationsStore";

export function NotificationBell() {
  const items = useNotificationsStore((s) => s.items);
  const clear = useNotificationsStore((s) => s.clear);

  const content = (
    <div
      style={{
        width: 320,
        background: "#1E2A47",
        border: "1px solid #28365A",
        borderRadius: 14,
        padding: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span style={{ color: "#EDF1FA", fontWeight: 600, fontSize: 14 }}>Уведомления</span>
        {items.length > 0 && (
          <Button type="link" size="small" onClick={clear} style={{ padding: 0 }}>
            Очистить
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <Empty description="Пока тихо" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 360, overflowY: "auto" }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                background: "#161F36",
                borderRadius: 10,
                padding: "8px 10px",
              }}
            >
              <div style={{ color: "#EDF1FA", fontSize: 13 }}>
                {item.message ?? item.type}
              </div>
              <div style={{ color: "#93A0C2", fontSize: 11, marginTop: 2 }}>
                {dayjs(item.receivedAt).format("HH:mm:ss")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  return content;
}

export function NotificationBellTrigger() {
  const count = useNotificationsStore((s) => s.items.length);

  return (
    <Dropdown popupRender={() => <NotificationBell />} trigger={["click"]} placement="bottomRight">
      <Badge count={count} size="small" offset={[-2, 2]}>
        <Button
          shape="circle"
          icon={<BellOutlined />}
          style={{ background: "#1E2A47", border: "1px solid #28365A" }}
        />
      </Badge>
    </Dropdown>
  );
}
