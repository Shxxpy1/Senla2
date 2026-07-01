import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider, App as AntApp } from "antd";
import { antdTheme } from "./theme/theme";
import { AppRouter } from "./router";
import { useAuthStore } from "./store/authStore";
import { useUserNotifications } from "./hooks/useUserNotifications";

function Bootstrap() {
  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useUserNotifications();

  return <AppRouter />;
}

export default function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <AntApp>
        <BrowserRouter>
          <Bootstrap />
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}
