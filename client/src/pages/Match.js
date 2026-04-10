import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Match.css";

import API from "../config/api";
import { GENDER_OPTIONS, MATCH_BUDGETS, PERSONALITY_OPTIONS, ROOM_TYPES, SCHEDULE_OPTIONS } from "../config/options";

const initialPrefs = {
  age: "21",
  budget: "600",
  personality: "Quiet",
  schedule: "Student",
  smoking: "false",
  gender: "Any",
  pets: "false",
  type: "any"
};

function Match({ user, onLoginClick }) {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState(initialPrefs);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = (e) => setPrefs((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const findMatch = async () => {
    if (!user) return onLoginClick();

    const age = Number(prefs.age);
    if (!Number.isFinite(age) || age < 16 || age > 99) {
      setError("Please enter a valid age between 16 and 99.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const { data } = await axios.post(API + "/api/match", {
        userPreferences: {
          age,
          budget: Number(prefs.budget),
          personality: prefs.personality,
          schedule: prefs.schedule,
          smoking: prefs.smoking === "true",
          preferredGender: prefs.gender,
          pets: prefs.pets === "true",
          type: prefs.type === "any" ? undefined : prefs.type
        }
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not find a match. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="match-page">
      <div className="container" style={{ padding: "40px 24px" }}>
        <div className="match-grid">
          <div className="match-panel">
            <div className="match-panel-header">
              <h1 className="section-title" style={{ marginBottom: 4 }}>AI Roommate Match</h1>
              <p style={{ color: "#666", fontSize: 14 }}>Tell us about yourself and our AI will find the room where you'll fit best.</p>
            </div>

            <div className="pref-card">
              <h3>Tell Us About Your Preferences:</h3>

              <div className="pref-table">
                <div className="pref-row">
                  <span className="pref-label">Your Age</span>
                  <input name="age" type="number" min="16" max="99" value={prefs.age} onChange={handle} className="pref-select" placeholder="e.g. 21" />
                </div>

                <div className="pref-row">
                  <span className="pref-label">Budget</span>
                  <select name="budget" value={prefs.budget} onChange={handle} className="pref-select">
                    {MATCH_BUDGETS.map((value) => (
                      <option key={value} value={String(value)}>{`Up to EUR ${value}/month`}</option>
                    ))}
                  </select>
                </div>

                <div className="pref-row">
                  <span className="pref-label">Personality</span>
                  <select name="personality" value={prefs.personality} onChange={handle} className="pref-select">
                    {PERSONALITY_OPTIONS.map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </div>

                <div className="pref-row">
                  <span className="pref-label">Schedule</span>
                  <select name="schedule" value={prefs.schedule} onChange={handle} className="pref-select">
                    {SCHEDULE_OPTIONS.map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </div>

                <div className="pref-row">
                  <span className="pref-label">Room Type</span>
                  <select name="type" value={prefs.type} onChange={handle} className="pref-select">
                    <option value="any">Any type</option>
                    {ROOM_TYPES.map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </div>

                <div className="pref-row">
                  <span className="pref-label">Smoking</span>
                  <select name="smoking" value={prefs.smoking} onChange={handle} className="pref-select">
                    <option value="false">Non-smoking only</option>
                    <option value="true">Smoking OK</option>
                  </select>
                </div>

                <div className="pref-row">
                  <span className="pref-label">Pets</span>
                  <select name="pets" value={prefs.pets} onChange={handle} className="pref-select">
                    <option value="false">No pets</option>
                    <option value="true">I have / want pets</option>
                  </select>
                </div>

                <div className="pref-row">
                  <span className="pref-label">I am</span>
                  <select name="gender" value={prefs.gender} onChange={handle} className="pref-select">
                    {GENDER_OPTIONS.map((value) => (
                      <option key={value} value={value}>{value === "Any" ? "Prefer any" : value}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && <div className="error-msg" style={{ marginTop: 12 }}>{error}</div>}

              <button className="btn btn-green btn-full btn-lg find-btn" onClick={findMatch} disabled={loading}>
                {loading
                  ? <span className="loading-dots">Finding your match<span className="dots"><span>.</span><span>.</span><span>.</span></span></span>
                  : user ? "Find My Match" : "Log In to Find Match"}
              </button>

              {!user && (
                <p style={{ textAlign: "center", fontSize: 13, color: "#888", marginTop: 10 }}>
                  <button onClick={onLoginClick} style={{ background: "none", border: "none", color: "#2E7D32", cursor: "pointer", fontWeight: 600 }}>Log in</button>
                  {" "}or{" "}
                  <button onClick={onLoginClick} style={{ background: "none", border: "none", color: "#2E7D32", cursor: "pointer", fontWeight: 600 }}>Register</button>
                  {" "}to use AI matching
                </p>
              )}
            </div>
          </div>

          <div className="match-result-panel">
            {!result && !loading && (
              <div className="match-empty">
                <h3>Your Best Match</h3>
                <p>Fill in your preferences and click "Find My Match" to see your AI-recommended room.</p>
              </div>
            )}

            {loading && (
              <div className="match-empty">
                <h3>Analyzing rooms...</h3>
                <p>Our AI is comparing your lifestyle with available listings and roommate preferences.</p>
              </div>
            )}

            {result?.match && (
              <div className="result-card">
                <div className="result-header"><span className="result-badge">Your Best Match:</span></div>
                <div className="result-matched-with">
                  <span className="result-label">Matched with:</span>
                  <strong className="result-room-name">{result.match.title}</strong>
                </div>
                <div className="result-reason">
                  <span className="result-label">Reason:</span>
                  <p>{result.reason}</p>
                </div>

                {result.match.roommatePrefs && (
                  <div className="result-roommate-prefs">
                    <span className="pref-chip">{result.match.roommatePrefs.personality}</span>
                    <span className="pref-chip">{result.match.roommatePrefs.schedule}</span>
                    <span className="pref-chip">{result.match.roommatePrefs.smoking ? "Smoking OK" : "No Smoking"}</span>
                    {result.match.roommatePrefs.gender !== "Any" && <span className="pref-chip">{result.match.roommatePrefs.gender} only</span>}
                    <span className="pref-chip">Age: {result.match.roommatePrefs.ageRange}</span>
                  </div>
                )}

                <div className="result-img-wrap">
                  <img
                    src={result.match.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600"}
                    alt={result.match.title}
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600";
                    }}
                  />
                </div>

                <div className="result-footer">
                  <div className="result-price-row">
                    <span className="result-price">EUR {result.match.price}<span>/month</span></span>
                    <span className="badge badge-blue">{result.match.type}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{result.match.location}</p>
                  <button className="btn btn-blue btn-full" style={{ marginTop: 16 }} onClick={() => navigate(`/listings/${result.match._id}`)}>View Details</button>
                </div>
              </div>
            )}

            {result && !result.match && (
              <div className="match-empty">
                <h3>No match found</h3>
                <p>{result.reason || "Try adjusting your budget or preferences."}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Match;
