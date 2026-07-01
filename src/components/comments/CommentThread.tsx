import { useEffect, useRef, useState } from "react";
import { Button, Divider, Empty, Input, Skeleton, Typography, message } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { useCommentsStore } from "../../store/commentsStore";
import { useAuthStore } from "../../store/authStore";
import { useTaskNotifications } from "../../hooks/useTaskNotifications";
import { normalizeApiError } from "../../api/client";
import { CommentNode } from "./CommentNode";
import type { WorkspaceRole } from "../../api/types";

interface Props {
  taskId: string;
  myRole: WorkspaceRole | null;
}

export function CommentThread({ taskId, myRole }: Props) {
  const user = useAuthStore((s) => s.user);
  const fetch = useCommentsStore((s) => s.fetch);
  const add = useCommentsStore((s) => s.add);
  const tree = useCommentsStore((s) => s.tree);
  const loading = useCommentsStore((s) => s.loading);
  const currentTaskId = useCommentsStore((s) => s.taskId);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(taskId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  // SSE: новые комментарии / изменения прилетают по каналу задачи
  useTaskNotifications(taskId, (event) => {
    if (event.type === "COMMENT_CREATED" || event.type === "TASK_UPDATED") {
      fetch(taskId);
    }
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tree]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await add(taskId, { content: text.trim() });
      setText("");
    } catch (e) {
      message.error(normalizeApiError(e).message);
    } finally {
      setSending(false);
    }
  };

  const isOwnThread = currentTaskId === taskId;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Divider style={{ margin: "8px 0" }} />
      <Typography.Title level={5} className="heading-font" style={{ margin: 0, color: "#EDF1FA" }}>
        Комментарии
      </Typography.Title>

      {/* список */}
      <div style={{ maxHeight: 420, overflowY: "auto", paddingRight: 4 }}>
        {loading && (!isOwnThread || tree.length === 0) ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : tree.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Комментариев пока нет — будьте первым"
          />
        ) : (
          <>
            {tree.map((comment) => (
              <CommentNode
                key={comment.id}
                comment={comment}
                taskId={taskId}
                currentUserId={user?.id}
                myRole={myRole}
                depth={0}
              />
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* ввод нового комментария (OBSERVER не может) */}
      {myRole !== "OBSERVER" && (
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <Input.TextArea
            rows={2}
            placeholder="Написать комментарий… (Ctrl+Enter — отправить)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
            }}
            style={{ flex: 1, resize: "none" }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            size="large"
            loading={sending}
            disabled={!text.trim()}
            onClick={handleSend}
          />
        </div>
      )}
    </div>
  );
}
