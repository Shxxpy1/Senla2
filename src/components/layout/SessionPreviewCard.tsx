import { useMemo } from "react";
import { UAParser } from "ua-parser-js";
import { GlobalOutlined, LaptopOutlined } from "@ant-design/icons";

/**
 * Уникальный элемент экранов входа/регистрации: живой превью того, что
 * сервер запишет в "Активные сессии" прямо сейчас — браузер и устройство
 * определяем на клиенте, IP/город явно подписаны как "определит сервер",
 * это честно объясняет механику сессий ещё до входа в систему.
 */
export function SessionPreviewCard() {
  const { browser, os, device } = useMemo(() => {
    const parser = new UAParser(navigator.userAgent);
    return {
      browser: parser.getBrowser(),
      os: parser.getOS(),
      device: parser.getDevice(),
    };
  }, []);

  const deviceLabel = device.model
    ? `${device.vendor ?? ""} ${device.model}`.trim()
    : "Десктоп";

  return (
    <div
      className="fade-rise"
      style={{
        background: "linear-gradient(155deg, #1E2A47 0%, #161F36 70%)",
        border: "1px solid #28365A",
        borderRadius: 18,
        padding: "20px 22px",
        maxWidth: 360,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 99,
            background: "#4ADE80",
            boxShadow: "0 0 0 4px rgba(74, 222, 128, 0.18)",
          }}
        />
        <span style={{ color: "#93A0C2", fontSize: 13 }}>
          Так этот вход увидят в «Активных сессиях»
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <LaptopOutlined style={{ fontSize: 18, color: "#6C8CFF" }} />
        <div>
          <div style={{ color: "#EDF1FA", fontWeight: 600, fontSize: 14 }}>
            {browser.name ?? "Браузер"} {browser.version?.split(".")[0] ?? ""} ·{" "}
            {os.name ?? "OS"} {os.version ?? ""}
          </div>
          <div style={{ color: "#93A0C2", fontSize: 12.5 }}>{deviceLabel}</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <GlobalOutlined style={{ fontSize: 18, color: "#FFB86B" }} />
        <div style={{ color: "#93A0C2", fontSize: 12.5 }}>
          IP и город сервер определит автоматически при входе
        </div>
      </div>
    </div>
  );
}
