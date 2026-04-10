import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import RoomDetail from "./pages/RoomDetail";
import Match from "./pages/Match";
import AddRoom from "./pages/AddRoom";
import Inbox from "./pages/Inbox";
import MyListings from "./pages/MyListings";
import NotFound from "./pages/NotFound";
import AuthModal from "./components/AuthModal";
import AppErrorBoundary from "./components/AppErrorBoundary";
import Navbar from "./components/Navbar";
import PremiumModal from "./components/PremiumModal";
import Footer from "./components/Footer";

function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setShowAuth(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const openLogin = () => { setAuthMode("login"); setShowAuth(true); };

  return (
    <Router>
      <div className="app-shell">
        <Navbar
          user={user}
          onLoginClick={openLogin}
          onLogout={handleLogout}
          onPremiumClick={() => setShowPremium(true)}
        />

        <main className="app-main">
          <AppErrorBoundary>
            <Routes>
              <Route path="/" element={<Home onLoginClick={openLogin} />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/listings/:id" element={<RoomDetail user={user} onLoginClick={openLogin} />} />
              <Route path="/match" element={<Match user={user} onLoginClick={openLogin} />} />
              <Route path="/add-room" element={<AddRoom user={user} onLoginClick={openLogin} />} />
              <Route path="/my-listings" element={<MyListings user={user} onLoginClick={openLogin} />} />
              <Route path="/inbox" element={<Inbox user={user} onLoginClick={openLogin} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppErrorBoundary>
        </main>

        {showAuth && (
          <AuthModal
            mode={authMode}
            onClose={() => setShowAuth(false)}
            onLogin={handleLogin}
            onSwitchMode={() => setAuthMode(authMode === "login" ? "register" : "login")}
          />
        )}

        {showPremium && (
          <PremiumModal
            user={user}
            onClose={() => setShowPremium(false)}
            onLoginClick={openLogin}
          />
        )}

        <Footer />
      </div>
    </Router>
  );
}

export default App;
