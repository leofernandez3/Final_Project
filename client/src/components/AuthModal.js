import { useState } from "react";
import axios from "axios";
import BootstrapModal from "./BootstrapModal";

import API from "../config/api";

function AuthModal({ mode, onClose, onLogin, onSwitchMode }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError("");
    const email = form.email.trim().toLowerCase();
    const password = form.password;
    const name = form.name.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!email || !password || (mode === "register" && !name)) {
      setError(mode === "login" ? "Email and password are required" : "Name, email and password are required");
      return;
    }
    if (!emailOk) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (mode === "register" && name.length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = mode === "login" ? { email, password } : { name, email, password };
      const res = await axios.post(API + endpoint, payload);
      onLogin(res.data.user, res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BootstrapModal
      show={true}
      onClose={onClose}
      title={mode === "login" ? "Welcome Back" : "Create Account"}
      maxWidth={520}
      footer={
        <div className="w-100 d-flex justify-content-between align-items-center">
          <small className="text-muted">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
          </small>
          <button className="btn btn-link p-0" onClick={onSwitchMode}>
            {mode === "login" ? "Register" : "Log In"}
          </button>
        </div>
      }
    >
      <p className="text-muted mb-3">
        {mode === "login" ? "Sign in to your account" : "Join KamerZoeker"}
      </p>

      {error && <div className="error-msg">{error}</div>}

      {mode === "register" && (
        <div className="form-group">
          <label>Full Name</label>
          <input name="name" placeholder="Your name" value={form.name} onChange={handle} />
        </div>
      )}

      <div className="form-group">
        <label>Email</label>
        <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handle} />
      </div>

      <div className="form-group">
        <label>Password</label>
        <input
          name="password"
          type="password"
          placeholder="********"
          value={form.password}
          onChange={handle}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
      </div>

      <button className="btn btn-green btn-full btn-lg" onClick={submit} disabled={loading} style={{ marginTop: 8 }}>
        {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
      </button>
    </BootstrapModal>
  );
}

export default AuthModal;

