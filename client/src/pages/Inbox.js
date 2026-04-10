import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

import API from "../config/api";

function Inbox({ user, onLoginClick }) {
  const location = useLocation();
  const [threads, setThreads] = useState([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const selectedThread = useMemo(
    () => threads.find((t) => t.threadKey === selectedKey) || null,
    [threads, selectedKey]
  );

  const loadThreads = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/messages/inbox`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = Array.isArray(res.data) ? res.data : [];
      setThreads(list);

      const roomFromQuery = new URLSearchParams(location.search).get("room");
      const fromQuery = roomFromQuery ? list.find((t) => t.room?._id === roomFromQuery) : null;
      const next = fromQuery || list[0] || null;
      setSelectedKey(next ? next.threadKey : "");
    } catch (err) {
      setError(err.response?.data?.message || "Could not load inbox");
    } finally {
      setLoading(false);
    }
  }, [location.search, user]);

  const loadMessages = useCallback(async (thread) => {
    if (!thread || !user) return;
    try {
      setError("");
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/messages/room/${thread.room._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const all = Array.isArray(res.data) ? res.data : [];
      const otherId = thread.otherUser?._id;
      const filtered = all.filter(
        (m) => m.sender?._id === otherId || m.recipient?._id === otherId
      );
      setMessages(filtered);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load conversation");
    }
  }, [user]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (selectedThread) loadMessages(selectedThread);
    else setMessages([]);
  }, [selectedThread, loadMessages]);

  const sendReply = async () => {
    if (!selectedThread) return;
    if (!reply.trim()) return;
    try {
      setSending(true);
      setError("");
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/api/messages/room/${selectedThread.room._id}`,
        { text: reply.trim(), recipientId: selectedThread.otherUser?._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReply("");
      await loadThreads();
      await loadMessages(selectedThread);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: "36px 24px" }}>
        <h2>Inbox</h2>
        <p>Please log in to view your messages.</p>
        <button className="btn btn-green" onClick={onLoginClick}>Log In</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "28px 24px" }}>
      <h1 className="section-title" style={{ marginBottom: 16 }}>Inbox</h1>
      {error && <div className="error-msg" style={{ marginBottom: 12 }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
        <div style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: 12, borderBottom: "1px solid #eee", fontWeight: 700 }}>Conversations</div>
          {loading ? (
            <div style={{ padding: 12, color: "#666" }}>Loading...</div>
          ) : threads.length === 0 ? (
            <div style={{ padding: 12, color: "#666" }}>No conversations yet.</div>
          ) : (
            <div style={{ maxHeight: 520, overflowY: "auto" }}>
              {threads.map((t) => (
                <button
                  key={t.threadKey}
                  onClick={() => setSelectedKey(t.threadKey)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    border: "none",
                    borderBottom: "1px solid #f2f2f2",
                    background: t.threadKey === selectedKey ? "#f4f9ff" : "white",
                    padding: 12,
                    cursor: "pointer"
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{t.otherUser?.name || "User"}</div>
                  <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>{t.room?.title}</div>
                  <div style={{ fontSize: 13, color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {t.lastMessage}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 12, display: "flex", flexDirection: "column", minHeight: 520 }}>
          {!selectedThread ? (
            <div style={{ padding: 16, color: "#666" }}>Select a conversation to view messages.</div>
          ) : (
            <>
              <div style={{ padding: 12, borderBottom: "1px solid #eee" }}>
                <div style={{ fontWeight: 700 }}>{selectedThread.otherUser?.name || "User"}</div>
                <div style={{ fontSize: 13, color: "#666" }}>{selectedThread.room?.title}</div>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "grid", gap: 8 }}>
                {messages.length === 0 ? (
                  <div style={{ color: "#666" }}>No messages yet.</div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m._id}
                      style={{
                        justifySelf: m.sender?._id === user._id ? "end" : "start",
                        background: m.sender?._id === user._id ? "#e8f5e9" : "#f5f5f5",
                        borderRadius: 10,
                        padding: "8px 10px",
                        maxWidth: "80%"
                      }}
                    >
                      <div style={{ fontSize: 13 }}>{m.text}</div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ padding: 12, borderTop: "1px solid #eee" }}>
                <textarea
                  rows={3}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write a reply..."
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
                />
                <button className="btn btn-green" style={{ marginTop: 8 }} onClick={sendReply} disabled={sending}>
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Inbox;
