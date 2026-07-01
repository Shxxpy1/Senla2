import { useState } from "react";
import { Avatar, Upload, message, Spin } from "antd";
import type { UploadProps } from "antd";
import { UserOutlined, CameraOutlined } from "@ant-design/icons";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../api/auth";

type CustomRequestOptions = Parameters<NonNullable<UploadProps["customRequest"]>>[0];

const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function AvatarUploader() {
  const user = useAuthStore((s) => s.user);
  const avatarVersion = useAuthStore((s) => s.avatarVersion);
  const uploadAvatar = useAuthStore((s) => s.uploadAvatar);
  const [loading, setLoading] = useState(false);

  const avatarSrc = user?.id ? `${authApi.avatarUrl(user.id)}&v=${avatarVersion}` : undefined;

  const handleUpload = async (options: CustomRequestOptions) => {
    const file = options.file as File;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      message.error("Поддерживаются только PNG, JPEG и WEBP");
      options.onError?.(new Error("invalid type"));
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      message.error(`Файл больше ${MAX_SIZE_MB} МБ`);
      options.onError?.(new Error("too large"));
      return;
    }

    setLoading(true);
    try {
      await uploadAvatar(file);
      message.success("Аватарка обновлена");
      options.onSuccess?.({}, new XMLHttpRequest());
    } catch (e) {
      message.error("Не получилось загрузить аватарку");
      options.onError?.(e as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Upload
      showUploadList={false}
      customRequest={handleUpload}
      accept={ACCEPTED_TYPES.join(",")}
    >
      <div style={{ position: "relative", width: 88, height: 88, cursor: "pointer" }}>
        <Avatar
          size={88}
          src={avatarSrc}
          icon={!avatarSrc ? <UserOutlined /> : undefined}
          style={{ border: "2px solid #28365A" }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -2,
            right: -2,
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "#6C8CFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "3px solid #161F36",
          }}
        >
          {loading ? (
            <Spin size="small" />
          ) : (
            <CameraOutlined style={{ color: "#fff", fontSize: 14 }} />
          )}
        </div>
      </div>
    </Upload>
  );
}
