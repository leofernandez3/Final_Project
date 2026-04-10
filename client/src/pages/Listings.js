import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import "./Listings.css";

import API from "../config/api";
import { CITIES, LISTING_BUDGETS } from "../config/options";

const buildFiltersFromSearch = (searchParams) => ({
  location: searchParams.get("location") || "all",
  maxPrice: searchParams.get("maxPrice") || "all",
  type: searchParams.get("type") || "all"
});

const buildRoomParams = (filters) => {
  const params = {};
  if (filters.location !== "all") params.location = filters.location;
  if (filters.maxPrice !== "all") params.maxPrice = filters.maxPrice;
  if (filters.type !== "all") params.type = filters.type;
  return params;
};

function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const initialFilters = useMemo(() => buildFiltersFromSearch(searchParams), [searchParams]);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  useEffect(() => {
    setLoading(true);
    axios
      .get(API + "/api/rooms", { params: buildRoomParams(initialFilters) })
      .then((res) => setRooms(Array.isArray(res.data) ? res.data : []))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, [initialFilters]);

  const setFilter = (key) => (e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  const applyFilters = () => {
    setSearchParams(buildRoomParams(filters));
  };

  return (
    <div className="listings-page">
      <div className="listings-header">
        <div className="container">
          <div className="listings-header-inner">
            <h1 className="section-title" style={{ marginBottom: 0 }}>Room Listings</h1>
            <div className="filter-bar">
              <div className="filter-item">
                <span className="filter-label">Location</span>
                <select value={filters.location} onChange={setFilter("location")}>
                  <option value="all">All Locations</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="filter-item">
                <span className="filter-label">Max Price</span>
                <select value={filters.maxPrice} onChange={setFilter("maxPrice")}>
                  <option value="all">Any Budget</option>
                  {LISTING_BUDGETS.map((value) => (
                    <option key={value} value={String(value)}>{`EUR ${value}`}</option>
                  ))}
                </select>
              </div>

              <button className="btn btn-green" onClick={applyFilters}>Filter Preferences</button>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "32px 24px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: "#333" }}>
          Available Rooms {rooms.length > 0 && <span style={{ color: "#888", fontWeight: 400, fontSize: 15 }}>({rooms.length} found)</span>}
        </h2>

        {loading ? (
          <div className="loading-state">Loading rooms...</div>
        ) : rooms.length === 0 ? (
          <div className="empty-state">No rooms match your filters. Try adjusting them.</div>
        ) : (
          <div className="listings-list">
            {rooms.map((room) => (
              <div key={room._id || room.id} className="listing-row">
                <div className="listing-row-img">
                  <img
                    src={room.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"}
                    alt={room.title}
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400";
                    }}
                  />
                </div>
                <div className="listing-row-body">
                  <h3>{room.title}</h3>
                  <div className="listing-row-meta">
                    <span className="room-price-big"><strong>EUR {room.price}</strong>/month</span>
                    <span className="badge badge-blue">{room.type}</span>
                    <span style={{ fontSize: 13, color: "#888" }}>{room.location}</span>
                    {room.smoking === false && <span style={{ fontSize: 13, color: "#888" }}>Non-Smoker</span>}
                  </div>
                  {room.description && <p className="listing-desc">{room.description}</p>}
                </div>
                <div className="listing-row-action">
                  <a href={`/listings/${room._id || room.id}`} className="btn btn-green">View Details</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Listings;
