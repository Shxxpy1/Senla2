import { useState } from "react";
import { Avatar, Button, Input, Popconfirm, message } from "antd";
import { UserOutlined, EditOutlined, DeleteOutlined, MessageOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useCommentsStore } from "../../store/commentsStore";
import { normalizeApiError } from "../../api/client";
import type { Comment, WorkspaceRole } from "../../api/types";

interface Props {
  comment: Comment;
  taskId: string;
  currentUserId?: string;
  myRole: WorkspaceRole | null;
  /** Глубина вложенности — ограничиваем отступ на уровне 3+ */
  depth?: number;
}

function canDeleteAsmod(myRole: WorkspaceRole | null): boolean {
  return myRole === "ADMIN" || myRole === "EDITOR";
}

export function CommentNode({ comment, taskId, currentUserId, myRole, depth = 0 }: Props) {
  const add = useCommentsStore((s) => s.add);
  const edit = useCommentsStore((s) => s.edit);
  const remove = useCommentsStore((s) => s.remove);

  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [editSaving, setEditSaving] = useState(false);

  const isAuthor = comment.authorId === currentUserId;
  const canEdit = isAuthor;
  const canDelete = isAuthor || canDeleteAsmod(myRole);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setReplySending(true);
    try {
      await add(taskId, { content: replyText.trim(), parentId: comment.id });
      setReplyText("");
      setReplyOpen(false);
    } catch (e) {
      message.error(normalizeApiError(e).message);
    } finally {
      setReplySending(false);
    }
  };

  const handleEdit = async () => {
    if (!editText.trim() || editText === comment.content) {
      setEditOpen(false);
      return;
    }
    setEditSaving(true);
    try {
      await edit(comment.id, editText.trim());
      setEditOpen(false);
    } catch (e) {
      message.error(normalizeApiError(e).message);
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await remove(comment.id);
    } catch (e) {
      message.error(normalizeApiError(e).message);
    }
  };

  const indent = Math.min(depth, 3) * 20;

  return (
    <div style={{ marginLeft: indent, marginBottom: 10 }}>
      <div
        style={{
          background: "#1E2A47",
          border: "1px solid #28365A",
          borderRadius: 14,
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar size={28} icon={<UserOutlined />} style={{ background: "#28365A" }}>
              {comment.authorLogin?.[0]?.toUpperCase()}
            </Avatar>
            <span style={{ color: "#EDF1FA", fontWeight: 600, fontSize: 13 }}>
              {comment.authorLogin ?? comment.authorId}
            </span>
            <span style={{ color: "#93A0C2", fontSize: 12 }}>
              {dayjs(comment.createdAt).format("D MMM, HH:mm")}
            </span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {canEdit && (
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  setEditText(comment.content);
                  setEditOpen(true);
                }}
              />
            )}
            {canDelete && (
              <Popconfirm
                title="Удалить комментарий?"
                description={
                  comment.replies?.length
                    ? "Ответы на этот комментарий тоже будут удалены."
                    : undefined
                }
                okText="Удалить"
                cancelText="Отмена"
                onConfirm={handleDelete}
              >
                <Button type="text" size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            )}
          </div>
        </div>

        {/* content or edit form */}
        {editOpen ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Input.TextArea
              autoFocus
              rows={2}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleEdit();
                if (e.key === "Escape") setEditOpen(false);
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <Button size="small" type="primary" loading={editSaving} onClick={handleEdit}>
                Сохранить
              </Button>
              <Button size="small" onClick={() => setEditOpen(false)}>
                Отмена
              </Button>
            </div>
          </div>
        ) : (
          <p style={{ color: "#EDF1FA", fontSize: 14, margin: 0, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
            {comment.content}
          </p>
        )}

        {/* reply toggle */}
        {!editOpen && (
          <Button
            type="link"
            size="small"
            icon={<MessageOutlined />}
            style={{ padding: 0, alignSelf: "flex-start", fontSize: 12 }}
            onClick={() => setReplyOpen((v) => !v)}
          >
            Ответить
          </Button>
        )}

        {/* inline reply form */}
        {replyOpen && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Input.TextArea
              autoFocus
              rows={2}
              placeholder="Ваш ответ…"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleReply();
                if (e.key === "Escape") setReplyOpen(false);
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                size="small"
                type="primary"
                loading={replySending}
                disabled={!replyText.trim()}
                onClick={handleReply}
              >
                Отправить
              </Button>
              <Button size="small" onClick={() => setReplyOpen(false)}>
                Отмена
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* recursive replies */}
      {comment.replies?.map((reply) => (
        <CommentNode
          key={reply.id}
          comment={reply}
          taskId={taskId}
          currentUserId={currentUserId}
          myRole={myRole}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}
