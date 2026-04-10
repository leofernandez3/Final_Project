import { useNavigate } from "react-router-dom";
import "./RoomCard.css";

function RoomCard({ room }) {
  const navigate = useNavigate();
  const id = room._id || room.id;

  return (
    <div className="room-card" onClick={() => navigate(`/listings/${id}`)}>
      <div className="room-card-img">
        <img
          src={room.image || `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400`}
          alt={room.title}
          onError={e => { e.target.src = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"; }}
        />
        <span className="room-type-badge">{room.type || "Shared Room"}</span>
      </div>
      <div className="room-card-body">
        <h3 className="room-title">{room.title}</h3>
        <div className="room-meta">
          <span className="room-price"><strong>EUR {room.price}</strong>/month</span>
          <span className="room-loc">{room.location}</span>
        </div>
        <p className="room-sub">{room.type} - {room.smoking ? "Smoking OK" : "Non-Smoker"}</p>
        <button className="btn btn-blue btn-full view-btn" onClick={e => { e.stopPropagation(); navigate(`/listings/${id}`); }}>
          View Details
        </button>
      </div>
    </div>
  );
}

export default RoomCard;

