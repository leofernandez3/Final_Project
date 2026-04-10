import { useState } from "react";
import BootstrapModal from "./BootstrapModal";

function PremiumModal({ user, onClose, onLoginClick }) {
  const [success, setSuccess] = useState(false);

  const subscribe = () => {
    if (!user) {
      onClose();
      onLoginClick();
      return;
    }
    setSuccess(true);
  };

  return (
    <BootstrapModal
      show={true}
      onClose={onClose}
      title="Go Premium"
      maxWidth={560}
    >
      <p className="text-muted mb-3">Unlock the full power of KamerZoeker</p>

      <div style={{ background: "#f9fafb", borderRadius: 10, padding: "16px 18px", marginBottom: 18 }}>
        {[
          "Advanced AI Roommate Matching",
          "Direct message potential roommates",
          "Instant alerts for new listings",
          "Priority listing placement",
          "Compatibility score reports",
          "Unlimited AI match requests"
        ].map((f, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 0",
              fontSize: 14,
              borderBottom: i < 5 ? "1px solid #e8e8e8" : "none"
            }}
          >
            <span>{f}</span>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 34, fontWeight: 800, color: "#1a1a2e" }}>Premium</span>
      </div>

      {success && <div className="success-msg">Premium is coming soon. Stay tuned.</div>}

      <button className="btn btn-gold btn-full btn-lg" onClick={subscribe} disabled={success}>
        {success ? "Coming Soon" : user ? "Notify Me" : "Log In to Continue"}
      </button>
    </BootstrapModal>
  );
}

export default PremiumModal;
