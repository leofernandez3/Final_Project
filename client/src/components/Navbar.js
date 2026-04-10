import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar({ user, onLoginClick, onLogout, onPremiumClick }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const closeMenus = () => {
    setMobileOpen(false);
    setDropdownOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom shadow-sm sticky-top app-navbar">
      <div className="container">
        <Link to="/" className="navbar-brand app-brand" onClick={closeMenus}>
          <span className="app-brand-title">KamerZoeker</span>
          <span className="app-brand-tagline">Student Roommate Finder</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${mobileOpen ? "show" : ""}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link to="/" className="nav-link" onClick={closeMenus}>Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/listings" className="nav-link" onClick={closeMenus}>Browse Listings</Link>
            </li>
            <li className="nav-item">
              <Link to="/match" className="nav-link" onClick={closeMenus}>My Matches</Link>
            </li>
            <li className="nav-item">
              <Link to="/add-room" className="nav-link fw-semibold text-success" onClick={closeMenus}>+ Add Room</Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2">
            {user ? (
              <>
                {!user.isPremium ? (
                  <button className="btn btn-gold" onClick={onPremiumClick}>Premium</button>
                ) : (
                  <span className="badge badge-gold">Premium</span>
                )}

                <div className={`dropdown ${dropdownOpen ? "show" : ""}`} ref={dropdownRef}>
                  <button
                    className="btn btn-outline-secondary dropdown-toggle"
                    type="button"
                    onClick={() => setDropdownOpen((v) => !v)}
                    aria-expanded={dropdownOpen}
                  >
                    {user.name}
                  </button>
                  <ul className={`dropdown-menu dropdown-menu-end ${dropdownOpen ? "show" : ""}`}>
                    <li>
                      <Link to="/my-listings" className="dropdown-item" onClick={closeMenus}>My Listings</Link>
                    </li>
                    <li>
                      <Link to="/inbox" className="dropdown-item" onClick={closeMenus}>Inbox</Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={() => {
                          closeMenus();
                          onLogout();
                        }}
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <button className="btn btn-gold" onClick={onPremiumClick}>Premium</button>
                <button className="btn btn-green" onClick={onLoginClick}>Log In</button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
