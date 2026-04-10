import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AddRoom.css";

import API from "../config/api";
import {
  AGE_RANGE_OPTIONS,
  CITIES,
  GENDER_OPTIONS,
  PERSONALITY_OPTIONS,
  ROOM_TYPES,
  SCHEDULE_OPTIONS
} from "../config/options";

const AMENITIES_OPTIONS = ["WiFi", "Kitchen", "Laundry", "Parking", "Gym", "Balcony", "Garden", "Study Room", "AC", "Washer", "Terrace", "Common Room", "Bike Storage", "Rooftop", "Dishwasher", "Pets OK"];

const initialForm = {
  title: "",
  price: "",
  location: "",
  type: "Shared Room",
  description: "",
  amenities: [],
  smoking: "false",
  personality: "Quiet",
  schedule: "Student",
  gender: "Any",
  ageRange: "18-24",
  pets: "false",
  extraNotes: ""
};

function AddRoom({ user, onLoginClick }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className="addroom-gate">
        <div className="addroom-gate-inner">
          <h2>Login Required</h2>
          <p>You need to be logged in to add a room listing.</p>
          <button className="btn btn-green btn-lg" onClick={onLoginClick}>Log In / Register</button>
        </div>
      </div>
    );
  }

  const handle = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const toggleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((item) => item !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const setBooleanPref = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("Only JPG, PNG, or WEBP images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  const submit = async () => {
    setError("");
    if (!form.title || !form.price || !form.location) return setError("Title, price and location are required");
    const numericPrice = Number(form.price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) return setError("Price must be a valid positive number.");
    if (!image) return setError("Please upload a room photo");

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Your session expired. Please log in again.");
        onLoginClick();
        return;
      }

      const data = new FormData();
      ["title", "price", "location", "type", "description", "smoking", "personality", "schedule", "gender", "ageRange", "pets", "extraNotes"].forEach((key) => data.append(key, form[key]));
      data.append("amenities", JSON.stringify(form.amenities));
      data.append("image", image);

      await axios.post(API + "/api/rooms", data, { headers: { Authorization: `Bearer ${token}` } });
      navigate("/listings");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addroom-page">
      <div className="container" style={{ padding: "36px 24px" }}>
        <div className="addroom-header">
          <h1 className="section-title">Add Your Room Listing</h1>
          <p>Fill in your room details and the type of roommate you're looking for.</p>
        </div>

        <div className="addroom-grid">
          <div className="addroom-section">
            <div className="addroom-card">
              <h3 className="addroom-card-title">Room Details</h3>

              <div className="form-group">
                <label>Room Title *</label>
                <input name="title" placeholder="e.g. Bright Room Downtown" value={form.title} onChange={handle} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Monthly Price (EUR) *</label>
                  <input name="price" type="number" placeholder="500" value={form.price} onChange={handle} />
                </div>
                <div className="form-group">
                  <label>Room Type *</label>
                  <select name="type" value={form.type} onChange={handle}>
                    {ROOM_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Location *</label>
                <select name="location" value={form.location} onChange={handle}>
                  <option value="">Select city / area</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Room Description</label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Describe the room size, natural light, nearby transport, vibe..."
                  value={form.description}
                  onChange={handle}
                />
              </div>

              <div className="form-group">
                <label>Amenities</label>
                <div className="amenities-picker">
                  {AMENITIES_OPTIONS.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      className={`amenity-btn ${form.amenities.includes(amenity) ? "selected" : ""}`}
                      onClick={() => toggleAmenity(amenity)}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="addroom-card">
              <h3 className="addroom-card-title">Room Photo</h3>
              <p className="addroom-hint">Upload a clear photo of the room. Any size or orientation works it will display properly automatically.</p>

              <div className="photo-upload-area" onClick={() => document.getElementById("room-img-input").click()}>
                {preview ? (
                  <div className="photo-preview">
                    <img src={preview} alt="preview" />
                    <div className="photo-preview-overlay">Click to change</div>
                  </div>
                ) : (
                  <div className="photo-placeholder">
                    <p>Click to upload room photo</p>
                    <small>JPG, PNG, WEBP (Max 5MB)</small>
                  </div>
                )}
              </div>
              <input id="room-img-input" type="file" accept=".jpg,.jpeg,.png,.webp" style={{ display: "none" }} onChange={handleImage} />
            </div>
          </div>

          <div className="addroom-section">
            <div className="addroom-card">
              <h3 className="addroom-card-title">Ideal Roommate Preferences</h3>
              <p className="addroom-hint">Tell us what kind of roommate you're looking for. Our AI uses this to match you with the right student.</p>

              <div className="form-row">
                <div className="form-group">
                  <label>Personality</label>
                  <select name="personality" value={form.personality} onChange={handle}>
                    {PERSONALITY_OPTIONS.map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Schedule</label>
                  <select name="schedule" value={form.schedule} onChange={handle}>
                    {SCHEDULE_OPTIONS.map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Preferred Gender</label>
                  <select name="gender" value={form.gender} onChange={handle}>
                    {GENDER_OPTIONS.map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Age Range</label>
                  <select name="ageRange" value={form.ageRange} onChange={handle}>
                    {AGE_RANGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pref-toggles">
                <div className="pref-toggle-row">
                  <div>
                    <strong>Smoking</strong>
                    <p>Is smoking allowed in the room?</p>
                  </div>
                  <div className="toggle-btns">
                    <button type="button" className={`toggle-btn ${form.smoking === "false" ? "active-no" : ""}`} onClick={() => setBooleanPref("smoking", "false")}>No</button>
                    <button type="button" className={`toggle-btn ${form.smoking === "true" ? "active-yes" : ""}`} onClick={() => setBooleanPref("smoking", "true")}>Yes</button>
                  </div>
                </div>

                <div className="pref-toggle-row">
                  <div>
                    <strong>Pets</strong>
                    <p>Are pets allowed?</p>
                  </div>
                  <div className="toggle-btns">
                    <button type="button" className={`toggle-btn ${form.pets === "false" ? "active-no" : ""}`} onClick={() => setBooleanPref("pets", "false")}>No</button>
                    <button type="button" className={`toggle-btn ${form.pets === "true" ? "active-yes" : ""}`} onClick={() => setBooleanPref("pets", "true")}>Yes</button>
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 16 }}>
                <label>Additional Notes about Ideal Roommate</label>
                <textarea
                  name="extraNotes"
                  rows={4}
                  placeholder="e.g. Looking for a clean, quiet student who studies a lot and comes home early..."
                  value={form.extraNotes}
                  onChange={handle}
                />
              </div>
            </div>

            <div className="addroom-card submit-card">
              {error && <div className="error-msg">{error}</div>}

              <div className="submit-summary">
                <div className="summary-row">
                  <span>Price</span>
                  <strong>{form.price ? `EUR ${form.price}/month` : "EUR -"}</strong>
                </div>
                <div className="summary-row">
                  <span>Type</span>
                  <strong>{form.type}</strong>
                </div>
                <div className="summary-row">
                  <span>Location</span>
                  <strong>{form.location || ""}</strong>
                </div>
                <div className="summary-row">
                  <span>Photo</span>
                  <strong>{image ? "Ready" : "Missing"}</strong>
                </div>
              </div>

              <button className="btn btn-green btn-full btn-lg" onClick={submit} disabled={loading}>
                {loading ? "Uploading..." : "Publish Listing"}
              </button>
              <button className="btn btn-outline btn-full" style={{ marginTop: 8 }} onClick={() => navigate("/listings")}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddRoom;
