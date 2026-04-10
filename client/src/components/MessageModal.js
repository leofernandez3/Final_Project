import { useState } from "react";
import axios from "axios";
import BootstrapModal from "./BootstrapModal";

import API from "../config/api";

function MessageModal({ room, user, onClose, onLoginClick }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const send = async () => {
    if (!user) {
      onClose();
      onLoginClick();
      return;
    }
    if (!text.trim()) {
      setError("Please write a message.");
      return;
    }

    try {
      setSending(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Your session expired. Please log in again.");
        onClose();
        onLoginClick();
        return;
      }

      await axios.post(
        `${API}/api/messages/room/${room._id}`,
        { text: text.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setText("");
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <BootstrapModal
      show={true}
      onClose={onClose}
      title="Message Landlord"
      maxWidth={620}
    >
      <p className="text-muted mb-3">
        {room?.title ? `About: ${room.title}` : "Send your first message"}
      </p>

      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">Message sent successfully.</div>}

      <textarea
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Hi, is this room still available?"
        style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
      />

      <button className="btn btn-green btn-full btn-lg" style={{ marginTop: 12 }} onClick={send} disabled={sending}>
        {sending ? "Sending..." : "Send Message"}
      </button>
    </BootstrapModal>
  );
}

export default MessageModal;

