import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import BootstrapModal from "../components/BootstrapModal";

import API from "../config/api";

function MyListings({ user, onLoginClick }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingRoom, setEditingRoom] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    price: "",
    location: "",
    type: "Shared Room",
    description: "",
    status: "Available"
  });

  const token = localStorage.getItem("token");

  const loadMyRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API}/api/rooms/mine`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load your listings");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!user || !token) return;
    loadMyRooms();
  }, [loadMyRooms, token, user]);

  const setRoomStatus = async (roomId, status) => {
    try {
      await axios.put(
        `${API}/api/rooms/${roomId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadMyRooms();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const deleteRoom = async (roomId) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await axios.delete(`${API}/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await loadMyRooms();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete listing");
    }
  };

  const openEdit = (room) => {
    setEditingRoom(room);
    setEditForm({
      title: room.title || "",
      price: room.price || "",
      location: room.location || "",
      type: room.type || "Shared Room",
      description: room.description || "",
      status: room.status || "Available"
    });
  };

  const saveEdit = async () => {
    if (!editingRoom) return;
    try {
      await axios.put(`${API}/api/rooms/${editingRoom._id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingRoom(null);
      await loadMyRooms();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save changes");
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: "36px 24px" }}>
        <h2>My Listings</h2>
        <p>Please log in to manage your listings.</p>
        <button className="btn btn-green" onClick={onLoginClick}>Log In</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "28px 24px" }}>
      <h1 className="section-title" style={{ marginBottom: 14 }}>My Listings</h1>

      {error && <div className="error-msg" style={{ marginBottom: 12 }}>{error}</div>}

      {loading ? (
        <div>Loading your listings...</div>
      ) : rooms.length === 0 ? (
        <div>You have not posted any rooms yet.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {rooms.map((room) => (
            <div key={room._id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12, display: "grid", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{room.title}</div>
                  <div style={{ color: "#666", fontSize: 13 }}>{room.location} - {room.type}</div>
                  <div style={{ color: "#1565C0", fontWeight: 700 }}>EUR {room.price}/month</div>
                </div>
                <div>
                  <span className={`badge ${room.status === "Lended" ? "badge-gold" : "badge-blue"}`}>
                    {room.status || "Available"}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="btn btn-outline" onClick={() => openEdit(room)}>Edit</button>
                <button
                  className="btn btn-blue"
                  onClick={() => setRoomStatus(room._id, room.status === "Lended" ? "Available" : "Lended")}
                >
                  {room.status === "Lended" ? "Mark Available" : "Mark as Lended"}
                </button>
                <button className="btn btn-outline" onClick={() => deleteRoom(room._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BootstrapModal
        show={Boolean(editingRoom)}
        onClose={() => setEditingRoom(null)}
        title="Edit Listing"
        maxWidth={620}
      >
        <div className="form-group">
          <label>Title</label>
          <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
        </div>

        <div className="form-group">
          <label>Price (EUR)</label>
          <input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
        </div>

        <div className="form-group">
          <label>Type</label>
          <select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}>
            <option>Shared Room</option>
            <option>Single Room</option>
            <option>Studio</option>
          </select>
        </div>

        <div className="form-group">
          <label>Status</label>
          <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
            <option value="Available">Available</option>
            <option value="Lended">Lended</option>
          </select>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea rows={4} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
        </div>

        <button className="btn btn-green btn-full" onClick={saveEdit}>Save Changes</button>
      </BootstrapModal>
    </div>
  );
}

export default MyListings;

