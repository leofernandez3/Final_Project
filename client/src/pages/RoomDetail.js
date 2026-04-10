import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import MessageModal from "../components/MessageModal";
import "./RoomDetail.css";

import API from "../config/api";

function RoomDetail({ user, onLoginClick }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [contacted, setContacted] = useState(false);
  const [landlordEmail, setLandlordEmail] = useState("");
  const [showMessageModal, setShowMessageModal] = useState(false);

  useEffect(() => {
    axios.get(`${API}/api/rooms/${id}`)
      .then((res) => {
        setRoom(res.data || null);
        setLoadError("");
      })
      .catch((err) => {
        setRoom(null);
        setLoadError(err.response?.data?.message || "Room not found.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="detail-loading">Loading room details...</div>;
  if (!room) return <div className="detail-loading">{loadError || "Room not found."}</div>;

  const isOwner = Boolean(
    user &&
    room?.postedBy &&
    String(room.postedBy._id || room.postedBy) === String(user._id)
  );

  const handleRevealEmail = () => {
    if (!user) {
      onLoginClick();
      return;
    }
    const email = room?.postedBy?.email;
    setLandlordEmail(typeof email === "string" ? email : "");
    setContacted(true);
  };

  return (
    <div className="detail-page">
      <div className="container" style={{ padding: "32px 24px" }}>
        <button className="back-btn" onClick={() => navigate(-1)}>Back to Listings</button>

        <div className="detail-grid">
          <div className="detail-left">
            <div className="detail-img-wrap">
              <img
                src={room.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"}
                alt={room.title}
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"; }}
              />
              <span className="detail-type-badge">{room.type}</span>
            </div>

            <div className="detail-card">
              <h1 className="detail-title">{room.title}</h1>
              <div className="detail-meta-row">
                <span className="detail-price"><strong>EUR {room.price}</strong>/month</span>
                <span className="detail-loc">{room.location}</span>
                {room.smoking === false && <span className="detail-tag">Non-Smoker</span>}
                {room.personality && <span className="detail-tag">{room.personality}</span>}
              </div>

              {room.description && (
                <div className="detail-section">
                  <h3>About this room</h3>
                  <p>{room.description}</p>
                </div>
              )}

              {room.amenities && room.amenities.length > 0 && (
                <div className="detail-section">
                  <h3>Amenities</h3>
                  <div className="amenities-grid">
                    {room.amenities.map((a, i) => (
                      <span key={i} className="amenity-chip">{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="detail-right">
            <div className="contact-card">
              <div className="contact-price-block">
                <span className="contact-price">EUR {room.price}</span>
                <span className="contact-per">/month</span>
              </div>
              <div className="contact-info">
                <div className="contact-row"><span>Type</span><strong>{room.type}</strong></div>
                <div className="contact-row"><span>Location</span><strong>{room.location}</strong></div>
                <div className="contact-row"><span>Smoking</span><strong>{room.smoking ? "Allowed" : "Not Allowed"}</strong></div>
                {room.personality && <div className="contact-row"><span>Personality</span><strong>{room.personality}</strong></div>}
              </div>

              {!isOwner && (
                <div style={{ display: "grid", gap: 8 }}>
                  <button
                    className="btn btn-green btn-full btn-lg"
                    onClick={() => room?._id && setShowMessageModal(true)}
                    disabled={!room?._id}
                  >
                    {user ? "Message Landlord" : "Log In to Message"}
                  </button>
                  <button className="btn btn-outline btn-full" onClick={handleRevealEmail}>
                    Reveal Landlord Email
                  </button>
                </div>
              )}

              {contacted && (
                <div className="success-msg" style={{ textAlign: "center", marginTop: 10 }}>
                  {landlordEmail ? (
                    <>Landlord email: <a href={`mailto:${landlordEmail}`}>{landlordEmail}</a></>
                  ) : (
                    "Landlord email is not available for this listing."
                  )}
                </div>
              )}

              <button className="btn btn-outline btn-full" style={{ marginTop: 10 }} onClick={() => navigate("/match")}>
                Find Similar with AI
              </button>
            </div>

            <div className="map-placeholder">
              <div className="map-inner">
                <h2>LOCATION</h2>
                <p>{room.location}</p>
                <small>Near university campus</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showMessageModal && (
        <MessageModal
          room={room}
          user={user}
          onClose={() => setShowMessageModal(false)}
          onLoginClick={onLoginClick}
        />
      )}
    </div>
  );
}

export default RoomDetail;

