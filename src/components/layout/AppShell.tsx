import type { ReactNode } from "react";
import { Layout, Menu, Avatar, Dropdown, type MenuProps } from "antd";
import {
  ProjectOutlined,
  ProfileOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../api/auth";
import { NotificationBellTrigger } from "../notifications/NotificationBell";

const { Sider, Header, Content } = Layout;

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const avatarVersion = useAuthStore((s) => s.avatarVersion);
  const logout = useAuthStore((s) => s.logout);

  const avatarSrc = user?.id ? `${authApi.avatarUrl(user.id)}&v=${avatarVersion}` : undefined;

  const userMenu: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Профиль и сессии",
      onClick: () => navigate("/profile"),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Выйти",
      danger: true,
      onClick: async () => {
        await logout();
        navigate("/login");
      },
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={232} style={{ borderRight: "1px solid #28365A" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "22px 20px",
          }}
        >
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: "linear-gradient(135deg, #6C8CFF, #8EA6FF)",
              display: "inline-block",
            }}
          />
          <span className="heading-font" style={{ color: "#EDF1FA", fontWeight: 700 }}>
            Task Tracker
          </span>
        </div>

        <Menu
          mode="inline"
          theme="dark"
          style={{ background: "transparent", borderInlineEnd: "none" }}
          selectedKeys={[location.pathname]}
          items={[
            {
              key: "/workspaces",
              icon: <ProjectOutlined />,
              label: "Пространства",
              onClick: () => navigate("/workspaces"),
            },
            {
              key: "/profile",
              icon: <ProfileOutlined />,
              label: "Профиль",
              onClick: () => navigate("/profile"),
            },
          ]}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 14,
            padding: "0 28px",
            borderBottom: "1px solid #1E2A47",
          }}
        >
          <NotificationBellTrigger />
          <Dropdown menu={{ items: userMenu }} trigger={["click"]} placement="bottomRight">
            <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <Avatar src={avatarSrc} icon={!avatarSrc ? <UserOutlined /> : undefined} />
              <span style={{ color: "#EDF1FA", fontSize: 14 }}>{user?.login ?? "Профиль"}</span>
            </div>
          </Dropdown>
        </Header>

        <Content style={{ padding: 32 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
