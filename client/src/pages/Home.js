import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RoomCard from "../components/RoomCard";
import "./Home.css";

import API from "../config/api";
import { CITIES, LISTING_BUDGETS, ROOM_TYPES } from "../config/options";

const initialFilters = { location: "all", budget: "all", type: "all" };

function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [featuredError, setFeaturedError] = useState("");
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    setLoadingFeatured(true);
    setFeaturedError("");
    axios
      .get(API + "/api/rooms/featured")
      .then((res) => setFeatured(Array.isArray(res.data) ? res.data : []))
      .catch(() => {
        setFeatured([]);
        setFeaturedError("Could not load featured listings right now.");
      })
      .finally(() => setLoadingFeatured(false));
  }, []);

  const setFilter = (key) => (e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (filters.location !== "all") params.set("location", filters.location);
    if (filters.budget !== "all") params.set("maxPrice", filters.budget);
    if (filters.type !== "all") params.set("type", filters.type);
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div className="home">
      <div className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">Find Your Perfect Room<br />or Roommate</h1>
          <p className="hero-sub">AI-powered platform to match students with ideal rooms and roommates.</p>

          <div className="search-box">
            <select value={filters.location} onChange={setFilter("location")}>
              <option value="all">Location</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <select value={filters.budget} onChange={setFilter("budget")}>
              <option value="all">Budget</option>
              {LISTING_BUDGETS.map((value) => (
                <option key={value} value={String(value)}>{`Up to EUR ${value}`}</option>
              ))}
            </select>

            <select value={filters.type} onChange={setFilter("type")}>
              <option value="all">Room Type</option>
              {ROOM_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <button className="btn btn-green" onClick={handleSearch}>Search</button>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "48px 24px" }}>
        <h2 className="section-title">Featured Listings</h2>
        {loadingFeatured ? (
          <div style={{ color: "#666" }}>Loading featured listings...</div>
        ) : featuredError ? (
          <div className="error-msg">{featuredError}</div>
        ) : featured.length === 0 ? (
          <div style={{ color: "#666" }}>No listings available yet.</div>
        ) : (
          <div className="rooms-grid">
            {featured.map((room) => (
              <RoomCard key={room._id || room.id} room={room} />
            ))}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 36 }}>
          <button className="btn btn-outline btn-lg" onClick={() => navigate("/listings")}>View All Listings</button>
        </div>
      </div>

      <div className="ai-cta">
        <div className="container">
          <div className="ai-cta-inner">
            <div>
              <h2>AI Roommate Matching</h2>
              <p>Tell us your preferences and our AI will find your perfect match instantly.</p>
            </div>
            <button className="btn btn-green btn-lg" onClick={() => navigate("/match")}>Try AI Match</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
